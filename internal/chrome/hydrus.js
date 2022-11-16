(function () {
    const AnchorTextMaxLength = 1024
    const AnchorHrefMaxLength = 2048
    const AnchorRelMaxLength = 128

    // parseUrl parses URL strings into absolute URLs with search parameters
    // sorted and IDNs represented in punycode.
    function parseUrl(urlString) {
        let u = new URL(urlString, document.baseURI)
        u.searchParams.sort()
        return u
    }

    // normalizeWhitespace replaces multiple spaces and tabs with a single
    // space character and replaces multiple CR/LFs with a single line feed.
    function normalizeWhitespace(str) {
        return str.replace(/[ \t]+/g, " ").replace(/\s*[\r\n]+\s*/g, "\n").trim()
    }

    // squashWhitespace replaces multiple whitespace characters with a single
    // space character to ensure the returned string is a one-liner.
    function squashWhitespace(str) {
        return str.replace(/\s+/g, " ").trim()
    }

    // makeAnchor creates a new anchor record from an anchor element.
    function makeAnchor(elem, articleElem) {
        let rect = elem.getBoundingClientRect()
        let flags = []
        if (!!articleElem && articleElem.contains(elem)) {
            flags.push("inarticle")
        }
        if (squashWhitespace((elem.getAttribute("target") || "")).toLowerCase() == "_blank") {
            flags.push("newtab")
        }
        return {
            text: squashWhitespace(elem.textContent || "") || squashWhitespace((elem.getAttribute("title") || "")),
            href: parseUrl((elem.getAttribute("href") || "")).href,
            rel: squashWhitespace((elem.getAttribute("rel") || "").replace(/,+/g, " ")).toLowerCase(),
            flags: flags.join(" "),
            rect: {
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
            }
        }
    }

    // validateAnchor returns whether an anchor record is valid.
    function validateAnchor(anchor) {
        if (!anchor) {
            return false
        }
        if (anchor.text.length > AnchorTextMaxLength) {
            return false
        }
        if (anchor.href.length === 0 || anchor.href.length > AnchorHrefMaxLength) {
            return false
        }
        if (anchor.rel.length > AnchorRelMaxLength) {
            return false
        }
        if (anchor.href.startsWith("javascript:")) {
            return false
        }
        return true
    }

    // TODO(peakji)
    let anchors = Array.from(document.body.querySelectorAll("a[href]")).map(x => makeAnchor(x)).filter(validateAnchor)
    return {
        anchors: anchors
    }
})()
