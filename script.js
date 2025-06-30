
const langTexts = {
  en: {
    description: "Upload an image to view and manage its metadata.",
    removed: "Metadata removed. Image ready for download."
  },
  kr: {
    description: "이미지를 업로드하면 메타데이터를 확인하고 삭제할 수 있습니다.",
    removed: "메타데이터가 제거되었습니다. 이미지를 저장할 수 있습니다."
  }
};

function setLanguage(lang) {
  document.getElementById("description").innerText = langTexts[lang].description;
}

document.getElementById("imageInput").addEventListener("change", async function () {
  const file = this.files[0];
  if (!file) return;

  const metaArea = document.getElementById("metaResult");
  metaArea.textContent = "Reading metadata...";

  const arrayBuffer = await file.arrayBuffer();
  const dataView = new DataView(arrayBuffer);
  const textLines = [];

  for (let i = 0; i < Math.min(1024, arrayBuffer.byteLength); i += 2) {
    const val = dataView.getUint16(i, false).toString(16);
    textLines.push(val);
  }

  metaArea.textContent = textLines.join(" ");
});

function removeMetadata() {
  const file = document.getElementById("imageInput").files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = "cleaned_" + file.name;
      link.href = canvas.toDataURL("image/jpeg");
      link.click();
      document.getElementById("metaResult").textContent = langTexts[document.getElementById("language").value].removed;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}



function displayMetadata(file) {
  const output = document.getElementById('output');
  output.innerHTML = '';

  const reader = new FileReader();
  reader.onload = function (e) {
    const view = new DataView(e.target.result);

    // JPEG 파일에서 EXIF는 APP1 세그먼트에 저장됨
    if (view.getUint16(0, false) !== 0xFFD8) {
      output.innerText = 'Not a valid JPEG file.';
      return;
    }

    let offset = 2;
    const length = view.byteLength;

    while (offset < length) {
      if (view.getUint16(offset + 2, false) <= 8) return;

      const marker = view.getUint16(offset, false);
      if (marker === 0xFFE1) {
        const app1Start = offset + 4;
        const exif = new TextDecoder().decode(new DataView(view.buffer, app1Start, 20));
        output.innerText = 'EXIF Segment Found: ' + exif;
        return;
      }

      offset += 2 + view.getUint16(offset + 2, false);
    }

    output.innerText = 'No EXIF metadata found.';
  };

  reader.readAsArrayBuffer(file);
}

document.getElementById('fileInput').addEventListener('change', function () {
  if (this.files && this.files[0]) {
    displayMetadata(this.files[0]);
  }
});
