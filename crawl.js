const {JSDOM} = require('jsdom')

async function crawlPage(baseURL, currentURL, pages) {
    const baseURLObj = new URL(baseURL)
    const curURLObj = new URL(currentURL)

    if (baseURLObj.hostname !== curURLObj.hostname) {
        return pages
    }
    
    const normalizedCurrentURL = normalizeURL(currentURL)
    if (pages[normalizedCurrentURL] > 0) {
        pages[normalizedCurrentURL]++
        return pages
    }

    pages[normalizedCurrentURL] = 1
    console.log(`actively crawling ${currentURL}`)

    try {
        const resp = await fetch(currentURL)
        if (resp.status > 399) {
            console.log(`error occured in fetch with status code: ${resp.status} on page ${currentURL}`)
            return pages
        }

        const contentType = resp.headers.get('content-type')
        if (!contentType.includes('text/html')) {
            console.log(`non html response, content type: ${contentType}, on page: ${currentURL}`)
            return pages
        }

        const htmlBody = await resp.text()
        const urls = getURLsFromHTML(htmlBody, baseURL)

        for(const url of urls) {
            pages = await crawlPage(baseURL, url, pages)
        }
    } catch (err) {
        console.log(`error occured in fetch: ${err.linkElements}, on page: ${currentURL}`)
    }
    
    return pages
}

function getURLsFromHTML(htmlBody, baseURL) {
    const urls = []
    const dom = new JSDOM(htmlBody)
    const linkElements = dom.window.document.querySelectorAll('a')
    for ( const element of linkElements) {
        if (element.href.slice(0, 1) === '/') {
            try {
                const urlObj = new URL(`${baseURL}${element.href}`)
                urls.push(urlObj.href)
            } catch (err) {
                console.log(`error with relative url: ${err}`)
            }
        } else {
            try {
                const urlObj = new URL(element.href)
                urls.push(urlObj.href)
            } catch (err) {
                console.log(`error with absolute url: ${err}`)
            }
        }
    }

    return urls
}

function normalizeURL(urlString) {
    const url = new URL(urlString)
    const hostPath = `${url.hostname}${url.pathname}`

    if (hostPath.length > 0 && hostPath.slice(-1) === '/') {
        return hostPath.slice(0, -1)
    }

    return hostPath
}

module.exports = {
    normalizeURL,
    getURLsFromHTML,
    crawlPage
}