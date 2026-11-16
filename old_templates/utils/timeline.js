const fileInput = document.querySelector("#timeline_input");
const btn = document.querySelector("#upload-label");

fileInput.addEventListener('change', () => {
    for (const file of fileInput.files) {
        console.log(file.name);
    }
});
