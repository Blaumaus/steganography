document.querySelector("#upload").addEventListener("change", handleFileUpload);
document.querySelector("#encode").addEventListener("click", encodeText);
document.querySelector("#decode").addEventListener("click", decodeText);

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const image = new Image();

function handleFileUpload(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    image.src = e.target.result;
    image.onload = function () {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
    };
  };
  reader.readAsDataURL(event.target.files[0]);
}

function encodeText() {
  const text = document.getElementById("text").value;
  if (!text) {
    alert("Please enter some text to encode.");
    return;
  }

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  let binaryText = "";

  // Convert each character to binary and add a delimiter
  for (let i = 0; i < text.length; i++) {
    let binaryChar = text.charCodeAt(i).toString(2).padStart(8, "0");
    binaryText += binaryChar;
  }

  // Add the null character to signal the end of the message
  binaryText += "00000000";

  // Ensure we don't overflow the image data
  if (binaryText.length > data.length / 4) {
    alert("Text is too long to encode in this image.");
    return;
  }

  // Encode each bit of the binaryText into the image
  for (let i = 0; i < binaryText.length; i++) {
    data[i * 4] = (data[i * 4] & 0b11111110) | parseInt(binaryText[i]);
  }

  ctx.putImageData(imgData, 0, 0);
  const outputImage = document.getElementById("outputImage");
  outputImage.src = canvas.toDataURL();
}

function decodeText() {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  let binaryText = "";
  let decodedText = "";

  // Extract binary data from the image
  for (let i = 0; i < data.length; i += 4) {
    binaryText += (data[i] & 1).toString();
  }

  // Convert binary data back to characters
  for (let i = 0; i < binaryText.length; i += 8) {
    let byte = binaryText.slice(i, i + 8);
    if (byte.length < 8) break; // Stop if the byte is incomplete
    let charCode = parseInt(byte, 2);
    if (charCode === 0) break; // Stop if we hit a null character
    decodedText += String.fromCharCode(charCode);
  }

  document.getElementById("decodedText").textContent = decodedText;
}
