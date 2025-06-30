const langText = {
  en: {
    instruction: "Upload an image to view and manage its metadata.",
    button: "Remove Metadata",
    download: "Download Clean Image"
  },
  ko: {
    instruction: "이미지를 업로드하면 메타데이터를 확인하고 삭제할 수 있습니다.",
    button: "메타데이터 삭제",
    download: "깨끗한 이미지 다운로드"
  }
};

function changeLanguage() {
  const lang = document.getElementById("language").value;
  document.getElementById("instruction").innerText = langText[lang].instruction;
  document.querySelector("button").innerText = langText[lang].button;
  document.getElementById("downloadLink").innerText = langText[lang].download;
}

function removeMetadata() {
  const fileInput = document.getElementById("imageUpload");
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const arrayBuffer = e.target.result;
    const blob = new Blob([arrayBuffer], { type: "image/jpeg" });
    const url = URL.createObjectURL(blob);
    document.getElementById("downloadLink").href = url;
    document.getElementById("downloadLink").style.display = "inline";
    extractMetadata(arrayBuffer);
  };
  reader.readAsArrayBuffer(file);
}

function extractMetadata(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  let metadata = "";
  for (let i = 0; i < 100; i++) {
    metadata += view.getUint8(i).toString(16).padStart(2, "0") + " ";
    if ((i + 1) % 16 === 0) metadata += "\n";
  }
  document.getElementById("metadataDisplay").innerText = metadata;
}
