//==================================================================================================================== 
/*
*   File Name: anucdle.js
*
*   Author: Aidan
*   Description: Javascript functions to assist with the frontend webpage.
*/
// ==================================================================================================================== #
var num_guesses = 6;
var width = 3;
var gameDone = false;
var win = false;

var currentRow = 0


window.onload = function() {
    populateDropdown();
    initialize();
};



/**
 * @brief Frontend webpage setup, sets up the table, and initializes the button
 */
function initialize() {

    // Create the game board
    for (let r = 0; r < num_guesses; r++) {
        for (let c = 0; c < width; c++) {
            let tile = document.createElement("span");
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add("tile");
            tile.innerText = "";
            document.getElementById("board").appendChild(tile);
        }
    }

    document.getElementById('guess-button').addEventListener('click', checkAnswer);
    document.getElementById('sorting-options').addEventListener('change', populateDropdown());
    document.getElementById("solution").innerText = "";
}

/**
 * @brief Sets up the dropdown by reading data from json file.
 */
function populateDropdown() {
    fetch("./app/videos.json")
    .then(response => response.json())
    .then(data => {
        const select = document.getElementById('song-select');
        let sortingOptions = 'title';
        sortingOptions = document.getElementById('sorting-options');
        let sortedData;

        switch(sortingOptions){
            case 'title':
                sortedData = Object.entries(data).sort((a, b) => a[1].title.localCompare(b[1].title));
            case 'date':
                sortedData = Object.entries(data).sort((a, b) => convertTimeToSeconds(a[1].upload_date) - convertTimeToSeconds(b[1].upload_date));
            case 'length':
                sortedData = Object.entries(data).sort((a, b) => convertMinutesSecondsToSeconds(a[1].length) - convertMinutesSecondsToSeconds(b[1].length));
        }
        console.log(sortedData);
        console.log(sortingOptions);

        for (const url in sortedData) {
            const title = data[url].title;
            const date = data[url].upload_date;
            const length = data[url].length;
            const option = document.createElement('option');
            option.value = url;
            option.textContent = `${title} = ${date} = ${length}`;
            select.appendChild(option);
        }
    })
    .catch(error => console.error('Error fetching JSON:', error));
}

/**
 * @brief Gets the data of the current guess in the dropdown box.
 * @returns The title, upload date and length of the video.
 */
function getGuess() {
    const select = document.getElementById('song-select');
    const selectedOption = select.options[select.selectedIndex].text;
    const [title, uploadDate, length] = selectedOption.split('=').map(item => item.trim());
    return { title, uploadDate, length };
}

/**
 * @brief Converts the string time into seconds, if the data contains year or month
 * @param {string} time The time as a string that is being converted. 
 * @returns The equivalent number of seconds as an int.
 */
function convertTimeToSeconds(time) {
    let seconds = 0;
    const timeParts = time.split(' ');

    const number = parseInt(timeParts[0], 10);
    const unit = timeParts[1].toLowerCase();

    if (unit.startsWith('year')) {
        seconds = number * 365 * 24 * 3600;
    } else if (unit.startsWith('month')) {
        seconds = number * 30 * 24 * 3600;
    } else if (unit.startsWith('week')) {
        seconds = number * 7 * 24 * 3600;
    }

    return seconds;
}

/**
 * @brief Converts the minutes:seconds into just seconds as an integer.
 * @param {string} timeStr The minutes:seconds as a string.
 * @returns The equivalent number of seconds as an int.
 */
function convertMinutesSecondsToSeconds(timeStr) {
    const parts = timeStr.split(':');
    parts.length === 2
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return (minutes * 60) + seconds;
}

/**
 * @brief Checks if the guessed answer is correct, fills in the table according to how close the answer was.
 * @returns None
 */
function checkAnswer() {
    if (gameDone) return;
    fetch("./app/daily/todays_info.json").then(response => response.json()).then(data => {
        var todays_data = data;

        const { title, uploadDate, length } = getGuess();
        const actual_title = todays_data.title;
        const actual_date = convertTimeToSeconds(todays_data.upload_date);
        const actual_length = convertMinutesSecondsToSeconds(todays_data.length);

        guessedDate = convertTimeToSeconds(uploadDate);
        guessedLength = convertMinutesSecondsToSeconds(length)

        let firstTile = document.getElementById(currentRow.toString() + "-0");
        let secondTile = document.getElementById(currentRow.toString() + "-1");
        let thirdTile = document.getElementById(currentRow.toString() + "-2");

        firstTile.innerText = title;
        secondTile.innerText = uploadDate;
        thirdTile.innerText = length;

        if (title == actual_title) {
            firstTile.classList.add("correct");
            secondTile.classList.add("correct");
            thirdTile.classList.add("correct");
            gameDone = true;
            document.getElementById("solution").innerText = `Solution: ${actual_title}`
        }

        else {
            firstTile.classList.add("incorrect");
            if (guessedDate == actual_date) {
                secondTile.classList.add("correct");
            }
            else {
                secondTile.classList.add("incorrect")
                if (guessedDate > actual_date) {
                    secondTile.innerText = secondTile.innerText + " (Lower)";
                } else {
                    secondTile.innerText = secondTile.innerText + " (Higher)";
                }
            }

            if (guessedLength == actual_length) {
                thirdTile.classList.add("correct");
            }
            else {
                thirdTile.classList.add("incorrect")
                if (guessedLength > actual_length) {
                    thirdTile.innerText = thirdTile.innerText + " (Lower)";
                } else {
                    thirdTile.innerText = thirdTile.innerText + " (Higher)";
                }
            }

            currentRow+=1;
        }

        if (!gameDone && currentRow == num_guesses) {
            gameDone = true;
            document.getElementById("solution").innerText = `Solution: ${actual_title}`
        }
    }) .catch(error => console.error('Error', error));
}


