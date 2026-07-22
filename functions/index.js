module.exports.handler = async function(event, context) {
    try {
        const host = event.headers.Host;

        const targetHost = host.replace(".f.fenny013.com", ".fenny013.com"); // YOUR URLS HERE, FOR EXAMPLE: host.replace(".f.example.com", ".example.com"); OR  CONVERSELY host.replace("example.com", ".f..example.com"); - *.example.com is proxy for *.f.example.com

        const path = event.params?.proxy
            ? "/" + event.params.proxy
            : "/";

        const query = event.queryStringParameters &&
            Object.keys(event.queryStringParameters).length
                ? "?" + new URLSearchParams(event.queryStringParameters)
                : "";

        const url = "https://" + targetHost + path + query;

        console.log("TARGET:", url);

        const response = await fetch(url);

        const contentType = response.headers.get("content-type") || "";

        let body;

        if (contentType.includes("text/html")) {
            let html = await response.text();

            const banner = `
<style>
#fenny-proxy-popup {
    position: fixed;
    left: 50%;
    bottom: 25px;
    transform: translateX(-50%) translateY(120px);

    background: rgba(20,20,25,0.85);
    backdrop-filter: blur(12px);

    color: white;
    padding: 16px 22px;

    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.15);

    box-shadow:
        0 10px 40px rgba(0,0,0,0.35);

    z-index: 999999;

    font-family:
        Inter,
        Arial,
        sans-serif;

    display: flex;
    align-items: center;
    gap: 20px;

    max-width: 90%;

    animation: fennyShow 0.5s cubic-bezier(.2,.8,.2,1)
        forwards;
}

#fenny-proxy-popup b {
    font-size: 15px;
    font-weight: 600;
}

#fenny-proxy-popup span {
    opacity: .65;
    font-size: 12px;
}

#fenny-proxy-popup button {
    background: rgba(255,255,255,.12);
    color: white;

    border: 1px solid rgba(255,255,255,.2);

    padding: 7px 14px;

    border-radius: 10px;

    cursor: pointer;

    transition: .2s;
}

#fenny-proxy-popup button:hover {
    background: rgba(255,255,255,.25);
}


@keyframes fennyShow {
    from {
        transform:
            translateX(-50%)
            translateY(120px);
        opacity:0;
    }

    to {
        transform:
            translateX(-50%)
            translateY(0);
        opacity:1;
    }
}
.fenny-link {
    color: #7ec8ff;
    text-decoration: none;
    font-weight: 700;
    transition: color .2s ease, text-shadow .2s ease;
}

.fenny-link:hover {
    color: #b5e3ff;
    text-shadow: 0 0 10px rgba(126,200,255,.6);
}

.fenny-link:active {
    color: #d8f1ff;
}

#fenny-proxy-popup code {
    background: rgba(255,255,255,.08);
    padding: 2px 6px;
    border-radius: 6px;
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    color: rgba(255,255,255,.9);
}
</style>


<div id="fenny-proxy-popup">
    <div>
        <b>
            Этот сайт проксирован с помощью
            <a
                href="https://github.com/fenny013/F"
                target="_blank"
                rel="noopener noreferrer"
                class="fenny-link"
            >
                Fenny's F
            </a>
        </b>
        <br>
        <span>уберите '<code>f.</code>' из адреса для оригинальной версии</span>
    </div>

    <button onclick="
        localStorage.setItem('fenny_popup_closed','1');
        document.getElementById('fenny-proxy-popup').remove();
    ">
        Закрыть
    </button>
</div>


<script>
if (localStorage.getItem('fenny_popup_closed')) {
    const popup = document.getElementById('fenny-proxy-popup');
    if (popup) popup.remove();
}
</script>
`;

            html = html.replace(
                /<body([^>]*)>/i,
                `<body$1>${banner}`
            );

            body = Buffer.from(html);

        } else {
            body = Buffer.from(await response.arrayBuffer());
        }


        const headers = {};

        for (const [key, value] of response.headers.entries()) {
            const lower = key.toLowerCase();

            if (
                lower !== "content-encoding" &&
                lower !== "content-length" &&
                lower !== "transfer-encoding"
            ) {
                headers[key] = value;
            }
        }


        return {
            statusCode: response.status,
            headers,
            isBase64Encoded: true,
            body: body.toString("base64")
        };


    } catch (e) {

        console.error(e);

        return {
            statusCode: 500,
            body: String(e)
        };
    }
};
