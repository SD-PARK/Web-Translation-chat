const realUpload = document.querySelector('.real-upload');
const upload = document.querySelector('.upload');
const form = document.querySelector('#editProfile');

upload.addEventListener('click', () => realUpload.click());
realUpload.addEventListener('change', getImageFiles);

function getImageFiles(e) {
    const files = e.currentTarget.files;
    console.log(typeof files, files);
    form.submit();
}