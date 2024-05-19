var num_guesses = 6;
var width = 3;
var gameDone = false;
var win = false;

var currentRow = 0


window.onload = function() {
    populateDropdown();
    initialize();
};


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
    document.getElementById("solution").innerText = "";
}

function populateDropdown() {
    fetch("./app/videos.json")
    .then(response => response.json())
    .then(data => {
        const select = document.getElementById('song-select');
        for (const url in data) {
            if (Object.hasOwnProperty.call(data, url)) {
                const title = data[url].title;
                const date = data[url].upload_date;
                const length = data[url].length;
                const option = document.createElement('option');
                option.value = url;
                option.textContent = `${title}, ${date}, ${length}`;
                select.appendChild(option);
            }
        }
    })
    .catch(error => console.error('Error fetching JSON:', error));
}

function getGuess() {
    const select = document.getElementById('song-select');
    const selectedOption = select.options[select.selectedIndex].text;
    const [title, uploadDate, length] = selectedOption.split(',').map(item => item.trim());
    return { title, uploadDate, length };
}

function convertTimeToSeconds(time) {
    let seconds = 0;
    const timeParts = time.split(' ');

    const number = parseInt(timeParts[0], 10);
    const unit = timeParts[1].toLowerCase();

    if (unit.startsWith('year')) {
        seconds = number * 365 * 24 * 3600;
    } else if (unit.startsWith('month')) {
        seconds = number * 30 * 24 * 3600;
    }

    return seconds;
}

function convertMinutesSecondsToSeconds(timeStr) {
    const parts = timeStr.split(':');
    parts.length === 2
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return (minutes * 60) + seconds;
}

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

