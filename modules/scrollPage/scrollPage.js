module.exports = async (scriptMode, lastContact, secondLastContact) => {
    try {
        let previousHeight = 0;
        let currentHeight = document.scrollingElement.scrollHeight;
        let total = 0;

        while (previousHeight < currentHeight) {
            total++;
            previousHeight = document.scrollingElement.scrollHeight;
            window.scrollBy(0, previousHeight);
            await new Promise(resolve => {
                setTimeout(resolve, 3000);
            });

            // scroll step up to load contacts list
            if (total === 2) {
                window.scrollBy({
                    top: -850,
                    behavior: "smooth"
                });
                await new Promise(resolve => {
                    setTimeout(resolve, 3000);
                });
            }

            if (scriptMode === "Update") {
                let contactHref = document.querySelectorAll(".mn-connection-card__details > a");

                // break while loop if lastContact in DOM
                contactHref.forEach((url, index) => {
                    if (url.href === (lastContact || secondLastContact)) {
                        previousHeight = document.scrollingElement.scrollHeight;

                        return index;
                    }
                });
            }

            currentHeight = document.scrollingElement.scrollHeight;
        }
    } catch (error) {
        console.log(`Scroll error = ${error}`);
    }
};
