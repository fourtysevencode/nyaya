const btn = document.querySelector("#upload-btn")
const result = document.querySelector("#result")
const uploaded_files = document.querySelector("#fir_input")
const input_image_name = document.querySelector('#input_image_name')
const server_url = 'http://localhost:8000'

uploaded_files.addEventListener('change', () => {
    input_image_name.innerText = uploaded_files.files[0].name
})

btn.addEventListener('click', async () => {
    console.log("Operation initialized")
    if (!uploaded_files.files[0]) {
        result.innerText = "no file uploaded"
        console.log("Operation Ended (No file attached)")
    } else {
        const fir = uploaded_files.files[0]
        const formData = new FormData() // key value pairs that can be sent through fetch()
        formData.append('file', fir) // appending key, value
        const res = await fetch(`${server_url}/fir_analysis`, { // `` creates a template (formatted string)
            method: "POST",
            body: formData // json of file: fir
        })
        const data = await res.json()
        result.innerHTML = marked.parse(data.analysis) // converting to marksown with cloudflare marked
        console.log("Operation completed")
    }
})

 // fix