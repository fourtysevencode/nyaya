const btn = document.querySelector("#upload-btn")
const result = document.querySelector("#result")
const uploaded_files = document.querySelector("#fir_input")
const input_image_name = document.querySelector('#input_image_name')
const server_url = 'https://fourtysevencode-nyaya.hf.space'

uploaded_files.addEventListener('change', () => {
    input_image_name.innerText = uploaded_files.files[0].name
})

btn.addEventListener('click', async () => {
    console.log("Operation initialized")
    result.innerHTML = "loading..."
    if (!uploaded_files.files[0]) {
        result.innerText = "no file uploaded"
        console.log("Operation Ended (No file attached)")
    } else {
        const fir = uploaded_files.files[0]
        const formData = new FormData()
        formData.append('file', fir)
        const res = await fetch(`${server_url}/fir_analysis`, {
            method: "POST",
            body: formData
        })
        const data = await res.json()

        if (data.error) {
            if (data.error.includes("503")) {
                result.innerText = "there's high demand right now, retry in a minute."
            } else {
                result.innerText = `something went wrong: ${data.error}`
            }
            console.log("Operation failed:", data.error)
            return
        }

        result.innerHTML = marked.parse(data.analysis)
        console.log("Operation completed")
    }
})