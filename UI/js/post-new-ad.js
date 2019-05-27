const previewBox = document.getElementById('preview-upload-image');
const uploadInput = document.getElementById('upload-image');

uploadInput.onchange = () => previewImage('upload-image', previewBox);

function previewImage(fieldId, previewB) {
	while (previewB.firstChild) previewB.removeChild(previewB.firstChild);
	const { files } = document.getElementById(fieldId);
	const total_file = files.length;
	for (let i = 0; i < total_file; i++) {
		const img = document.createElement('img');
		img.src = URL.createObjectURL(files[i]);
		previewB.appendChild(img);
	}
}
