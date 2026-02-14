const file_upload = document.getElementById("file_upload");
        const preview = document.getElementById("preview");
        const btn_humanizar = document.getElementById("btn_humanizar");
        const txt_humanizar = document.getElementById("txt_humanizar");
        const results = document.getElementById("results");
        const spinner_humanizar = document.getElementById("spinner_humanizar");
        const spinner_download = document.getElementById("spinner_download");
        const filename = document.getElementById("filename");
        const size = document.getElementById("size");
        const checkbox = document.getElementById("ia_decide");
        const promptConfig = document.getElementById("prompt-config");
        const btn_buscar_img_shopee = document.getElementById("btn_buscar_img_shopee");

        // eventos
        btn_humanizar.onclick = send;
        btn_buscar_img_shopee.onclick = buscar_imagem_shopee;
        ["input", "click"].forEach(evt =>
    checkbox.addEventListener(evt, togglePrompt)
);

        // estado inicial
        togglePrompt();

        file_upload.onchange = () => {

            const file = file_upload.files[0];
            if (!file) return;

            const imgPreview = document.createElement("img");
            imgPreview.src = URL.createObjectURL(file);
            imgPreview.className = "max-w-[220px] mx-auto rounded-xl border border-slate-600";


            preview.innerHTML = "";
            preview.appendChild(imgPreview);

            const img = new Image();

            img.onload = () => {

                const width = img.width;
                const height = img.height;

                const sizeKB = (file.size / 1024).toFixed(1);

                filename.textContent = `${file.name} — ${width}x${height}px`;
                size.textContent = `Tamanho: ${sizeKB} KB`;
            };

            img.src = URL.createObjectURL(file);
        };

        function togglePrompt() {
    setTimeout(() => {
        promptConfig.style.display = checkbox.checked ? "none" : "grid";
    }, 0);
}

        async function buscar_imagem_shopee() {
            const link = document.getElementById("link_shopee").value.trim();
            if (!link) {
                alert("Cole um link da Shopee.");
                return;
            }
            // loading igual Humanizar
            btn_buscar_img_shopee.textContent = "Buscando...";
            spinner_download.classList.remove("hidden");
            btn_buscar_img_shopee.disabled = true;
            btn_buscar_img_shopee.classList.add("opacity-60");
            preview.innerHTML = "";
            filename.textContent = "";
            size.textContent = "";

            try {
                const res = await fetch("https://reflectively-uninvestigable-rocco.ngrok-free.dev/extract", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        url: link
                    })
                });

                const data = await res.json();
                if (!data.images || !data.images.length) {
                    throw "Nenhuma imagem retornada";
                }

                // pega primeira imagem
                const imgUrl = data.images[0];
                const imgPreview = document.createElement("img");
                imgPreview.src = imgUrl;
                imgPreview.className = "max-w-[220px] mx-auto rounded-xl border border-slate-600";
                preview.appendChild(imgPreview);

                // dimensões
                const img = new Image();
                img.crossOrigin = "anonymous";

                img.onload = async () => {

                    const width = img.width;
                    const height = img.height;

                    // baixa imagem pra calcular tamanho
                    const response = await fetch(imgUrl);
                    const blob = await response.blob();

                    const sizeKB = (blob.size / 1024).toFixed(1);

                    filename.textContent = `Shopee — ${width}x${height}px`;
                    size.textContent = `Tamanho: ${sizeKB} KB`;
                };

                img.src = imgUrl;


            } catch (err) {
                alert("Erro ao buscar imagem");
                console.error(err);
            }

            // volta botão
            btn_buscar_img_shopee.textContent = "Buscar na Shopee";
            spinner_download.classList.add("hidden");
            btn_buscar_img_shopee.disabled = false;
            btn_buscar_img_shopee.classList.remove("opacity-60");
        }

        async function send() {
            txt_humanizar.textContent = "Humanizando...";
            spinner_humanizar.classList.remove("hidden");
            btn_humanizar.disabled = true;
            btn_humanizar.classList.add("opacity-60");

            const file = file_upload.files[0];
            const num = document.getElementById("qtd_images").value;

            const prompt = {
                ia_decide: checkbox.checked,
                pessoas: document.getElementById("pessoas").value,
                objetos: document.getElementById("objetos").value,
                ambiente: document.getElementById("ambiente").value,
                estilo: document.getElementById("estilo").value
            };


            if (!file) {
                alert("Selecione uma imagem");
                return;
            }

            const form = new FormData();
            form.append("file", file);
            form.append("num_images", num);
            form.append("prompt", JSON.stringify(prompt));

            spinner_humanizar.style.display = "inline-block";
            // loader.style.display = "block";
            results.innerHTML = "";

            const res = await fetch("https://reflectively-uninvestigable-rocco.ngrok-free.dev/humanizar", {
                method: "POST",
                body: form
            });

            const data = await res.json();

            spinner_humanizar.style.display = "none";
            // loader.style.display = "none";

            data.images.forEach((img, i) => {
                const div = document.createElement("div");
                div.className = "result";
                div.innerHTML = `
                <img src="${img}" class="rounded-xl border border-slate-600">
                <a class="block text-center text-xs text-blue-400 mt-1 hover:underline"
                    href="${img}" download="imagem_${i}.png">
                    Download
                </a>
                `;
                results.appendChild(div);
            });

            txt_humanizar.textContent = "Humanizar";
            spinner_humanizar.classList.add("hidden");
            btn_humanizar.disabled = false;
            btn_humanizar.classList.remove("opacity-60");
        }
