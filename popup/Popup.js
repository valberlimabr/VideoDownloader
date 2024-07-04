
const convertMediaSize = (size) => {
    if (size < 1073741824)
        return (Math.round(size / 1048576)) + " MB";
    else
        return (Math.round(size / 1073741824)) + " GB";
};

const buildItem = (media) => {
    const item = document.querySelector("#download_item_template").cloneNode(true);
    item.removeAttribute("id");
    item.setAttribute("data-id", media.id);
    item.style.display = "block";

    const downloadButton = item.querySelector(".download_button");
    downloadButton.setAttribute("href", "#");

    const downloadUrl = item.querySelector(".download_url");
    downloadUrl.textContent = media.filename;
    media.filename = media.filename.replace(/[\/:\\*?"<>|]/i, " ");
    downloadUrl.setAttribute("href", media.url);
    downloadUrl.setAttribute("title", media.url);

    downloadButton.addEventListener("click", async (event) => {
        console.log('startDownload', media);
        console.log(media.filename);
        if (media.source === "sniffer" || media.source === "youtube") {
            try {
                await chrome.downloads.download({
                    url: media.url,
                    filename: media.filename + "." + media.ext,
                    saveAs: true
                });
                console.log('DOWNLOAD iniciado');
            } catch (e) {
                console.log(e);
            }
        } else if (media.source === "stream") {
            chrome.runtime.sendMessage({ action: "startStream", media });
            chrome.tabs.create({ url: "download_manager/DownloadManager.html" });
        }

        event.stopPropagation();
    });


    const copyLinkButton = item.querySelector(".copy_link_button");
    copyLinkButton.addEventListener("click", (event) => {
        navigator.clipboard.writeText(media.url).then(() => {
            console.log('Link copiado para a área de transferência:', media.url);
            alert('Link copiado para a área de transferência!');
        }).catch((e) => {
            console.log('Erro ao copiar o link:', e);
        });
        event.stopPropagation();
    });

    const downloadSize = item.querySelector(".download_size");
    if (media.source === "stream") {
        downloadSize.textContent = "Stream";
    } else if (media.source === "youtube") {
        downloadSize.textContent = "[" + media.qualify + "]";
    } else {
        downloadSize.textContent = convertMediaSize(media.size);
    }

    return item;
};

const initPopup = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.runtime.sendMessage({ action: "getMediaData", tabId: tab.id }, (response) => {
        const media = response.media;
        const container = document.querySelector("#download_item_container");

        if (!media || media.length === 0) {
            container.textContent = "Nenhum vídeo encontrado.";
            container.style.color = "#b89a52";
            return;
        }

        const title = document.querySelector("#download_title");
        if (title) {
            title.style.display = "block";
        }

        container.innerHTML = "";

        media.forEach((m) => {
            try {
                const item = buildItem(m);
                container.appendChild(item);
            } catch (e) {
                console.log(e);
            }
        });
    });
};

initPopup();
