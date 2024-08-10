function sortPages(pages = {}) {
    if (Object.entries(pages).entries === 0) {
        console.log(``)
        return []
    }

    const pagesArr = Object.entries(pages)
    pagesArr.sort((a, b) => {
        return b[1] - a[1]
    })

    return pagesArr
}

function printReport(pages) {
    console.log('=====[Report]=====')
    const sPages = sortPages(pages)
    for(const page of sPages) {
        console.log(`Found ${page[1]} links to page: ${page[0]}`)
    }

    console.log("=====[End of Report]=====")
}

module.exports = {
    sortPages,
    printReport
}