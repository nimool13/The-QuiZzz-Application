/* eslint-disable no-undef */

/**
* @author FirstName LastName <optionalEmail@example.com>
*/
let nick
const modal = document.getElementById('myModal')
const modalCo = document.getElementsByClassName('modal-content')
let userName
let hasStarted = null

let currentQuestionNumber = 0
let interval = null
const url = 'https://courselab.lnu.se/quiz/question/1'
getUserName()
dashbord(url)
let seconds = 10
let total = 0
const s = $(timer).find('.seconds') // make sure to add a class to your element
function pad (d) { // pad the date
  return (d > 0) ? '0' + d.toString() : d.toString()
}
/**
*  Function that will refresh the clock.
* @function refreshClock
*/
async function refreshClock () { // refresh the clock
  $(s).text(pad(seconds))
  if (seconds === 0 && hasStarted === true) {
    $('div.grid').slideUp(300).delay(8000).fadeIn(400)
    donePlaying()
  }
}
/**
* Clears the clock for an interval.
* @function clear
* @param {Object} intervalID
*/
function clear (intervalID) { // clear the clock
  clearInterval(intervalID)
}
/**
* Restart the clock every 10 seconds.
* @function restartClock
*/
function restartClock () { // restart the clock
  clear(interval)
  hasStarted = false

  seconds = 10
  $(s).text('10')
  $(timer).find('span').removeClass('red')
}
/**
* Count down the time until a certain event, update the seconds variable and call refreshClock()
* @function countDown
*/
function countDown () { // start the clock
  hasStarted = true
  interval = setInterval(() => { // update the clock
    if (seconds > 0) {
      --seconds
      refreshClock()
    }
  }, 1000)
}
/**
* Posts  answers to the server  and check if it is a win
* @function post
* @param {Object} answer
* @param {Object} poster
* @returns
*/
async function post (answer, poster) { // post the answer to the server
  const postAnswer = {
    answer: answer
  }
  const response = await fetch(poster, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postAnswer)
  })
  if (response.status === 200) {
    const GetPostedResponse = []
    const json = await response.json()
    GetPostedResponse.push(json)
    GetPostedResponse.push(true)
    total = total + seconds
    restartClock()
    console.log(currentQuestionNumber)
    if (currentQuestionNumber === 7) {
      document.getElementById('winelose').innerHTML = 'CONGRATS ' + nick + ' YOU WIN!! That was not so hard now was it?'
      saveScores(total)
      topScores()
    }
    return GetPostedResponse
  } else {
    donePlaying()
    topScores()
    return false
  }
}
/**
* Create a list of the top five players
* @function topScores
*/
function topScores () {
  const create = document.createElement('ol')
  create.setAttribute('class', 'rounded-list')
  modalCo[0].appendChild(create)
  const storedNames = JSON.parse(localStorage.getItem('names'))
  const storedscores = JSON.parse(localStorage.getItem('scores'))
  const pio = []
  for (let i = 0; i < storedscores.length; i++) {
    pio[i] = {
      name: storedNames[i],
      score: storedscores[i]
    }
  }
  const please = getTopFiveMap(pio)
  for (let i = 0; i < please.length; i++) {
    create.innerHTML += ` 
        <li><a>${please[i].name} : ${please[i].score}</a></li>
        `
  }
  donePlaying()
}
/**
* Brief description of the function here.
* @function donePlaying
*/
async function donePlaying () {
  $('div.grid').slideUp(300).delay(8000).fadeIn(400)
  modal.style.display = 'block'
  await new Promise((resolve) => {
    setTimeout(resolve, 3000)
    resolve('OK')
  })
}
/**
* Shows a modal window to the user
* @generator
* @function getUserName
* @returns
*/
function getUserName () {
  userName = prompt('Please enter your name')
  if (userName != null || userName !== '') {
    document.getElementById('welcome').innerHTML =
            'Player Name:  ' + userName
    nick = userName
    storeNames(userName)
    return userName
  } else {
    userName = getUserName()
  }
  return userName
}
/**
* Stores the name of a user in localStorage.
* @function storeNames
* @param {String} name
*/
function storeNames (name) {
  if (name === null) {
    getUserName()
  } else {
    let names = []
    if (localStorage.getItem('names') === null) {
      names.push(name)
      localStorage.setItem('names', JSON.stringify(names))
    } else {
      names = JSON.parse(localStorage.getItem('names'))
      names.push(name)
      localStorage.setItem('names', JSON.stringify(names))
    }
  }
}
/**
* Save the scores that are currently in localStorage
* @function saveScores
* @param {Number} score
*/
function saveScores (score) {
  let scores = []
  if (localStorage.getItem('scores') === null) {
    scores.push(score)
    localStorage.setItem('scores', JSON.stringify(scores))
  } else {
    scores = JSON.parse(localStorage.getItem('scores'))
    scores.push(score)
    localStorage.setItem('scores', JSON.stringify(scores))
  }
}
/**
* Returns the top five maps of a list of maps (Get top five elements in MAP with index)
* @function getTopFiveMap
* @param {Object} map All listed players
* @returns {object} Array with top 5 players
*/
function getTopFiveMap (map) {
  let index = 0
  if (map.length < 5) {
    index = map.length
  } else {
    index = 5
  }
  const topFive = []
  const sorted = map.sort(function (a, b) {
    return b.score - a.score
  })
  const reversed = sorted.reverse()
  for (let i = 0; i < index; i++) {
    topFive.push(reversed[i])
  }
  return topFive
}
/**
* Gets the questions from the server and pushes them into an array.
* The data is then parsed as JSON and pushed into an element on the page.
* @function dashbord
*/
function dashbord (url) { // dashbord function to get the questions from the server
  countDown()
  showProgress()
  const GetData = []
  fetch(url) // fetch the data from the server
    .then((resp) => resp.json()) // parse the data as JSON
    .then(function (data) { // use the data
      GetData.push(data.question)
      GetData.push(data.nextURL)
      const element = document.getElementById('question')
      element.innerHTML = data.question
      const btn = document.createElement('button')
      const t = document.getElementsByClassName('buttons')
      switch (data.alternatives) { // switch case to check if  the alternatives exists or not
        case undefined:
          var p = document.createElement('div')
          p.innerHTML = ' <input type=\'text\' id=\'next\' >'
          p.setAttribute('class', 'inputs')
          btn.innerHTML = 'Submit'
          btn.setAttribute('class', 'submit')
          t[0].appendChild(p)
          p.appendChild(btn)
          break
        default:
          Object.keys(data.alternatives).forEach(function (alt) {
            const t = data.alternatives[alt]
            GetData.push({ alt, t })
          })
          p = document.createElement('div')
          p.setAttribute('class', 'choices')
          p.innerHTML = `<button class='but' id='alt1'></button>
                    <button class='but' id='alt2'></span></button>
                    <button class='but' id='alt3'></button>
                    <button class='but' id='alt4'></button>`
          t[0].appendChild(p)
      }
      return GetData
    }).then(function (GetData) { // use the data
      const b = document.querySelectorAll('.but')
      if (GetData.length > 2) { //  if the data has alternatives then show the alternatives
        if (GetData.length < 6) {
          document.getElementById('alt4').remove()
          document.getElementById('alt3').style.marginLeft = '7em'
        }
        for (let i = 2; i < GetData.length; i++) {
          const element = document.getElementById('alt' + (i - 1))
          element.innerHTML = GetData[i].t
        }
        for (let s = 0; s < b.length; s++) {
          b[s].addEventListener('click', function () {
            const el = document.getElementsByClassName('choices')
            post(b[s].id, GetData[1]).then(function (checker) {
              switch (checker[1]) {
                case true:
                  dashbord(checker[0].nextURL)
                  el[0].remove()
                  break
                case false:
                  break
                default:
                  break
              }
            })
          })
        }
      }
      if (GetData.length === 2) { // if the data has no alternatives then take user answer
        const submitted = document.getElementsByClassName('submit')
        const el = document.getElementsByClassName('inputs')
        submitted[0].addEventListener('click', function () {
          post(document.getElementById('next').value, GetData[1]).then(function (checker) {
            switch (checker[1]) {
              case true:
                dashbord(checker[0].nextURL)
                el[0].remove()
                break
              case false:
                break
              default:
                break
            }
          })
        })
      }
    })
    .catch(function (error) {
      console.log(error)
    })
}
/**
* show the progress of the Quiz
* @function showProgress
*/
function showProgress () {
  currentQuestionNumber++
  const element = document.getElementById('progress')
  element.innerHTML = 'Question ' + currentQuestionNumber + ' of  7'
};
