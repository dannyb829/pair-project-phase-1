
// Grabing the elements we need to operate on

const thoughtsForm = document.querySelector('#thoughts-form')
const imageBox = document.getElementById('image-box')
const cycleButton = document.getElementById('change-movie')
const movieTextHeader = document.getElementById('movie-title')
const usernameInput = document.getElementById("username-input");
const commentInput = document.getElementById("comment-input");
const commentList = document.getElementById("comment-list");
const allStars = document.querySelectorAll('.rating-star');
const similarTitlesBox = document.getElementById('similar-titles-box');
const movieInfoBox = document.getElementById('movie-info-box');
let imageCount = 0
let currentMovieNum
let currentMovieId



// Making all our submitables and clickables clickable and submitable ! 

thoughtsForm.addEventListener('submit',(e) => addComment(e))


allStars.forEach(star => star.addEventListener('click', (e) => {
    const star = e.target
    const num = parseInt(star.id.replace("s",""), 10)
    persistStars(currentMovieNum, num)
}))


cycleButton.addEventListener('click', getImage)


// All our functions, we can definately get clearer more understandable function and variable names
// for example the getImage should be getMovie and so on

function getImage(){
    imageCount += 1
    if (imageCount >= 10) {
        imageCount = 1
    } 
    fetch(`http://localhost:3000/images/${imageCount}`)
    .then(resp => resp.json())
    .then(img => {
        postImage(img)
        postComments(img.comments)
    })    
} 


function postImage(img){
    imageBox.src = img.gifURL
    movieTextHeader.textContent = img.title
    currentMovieNum = img.id
    currentMovieId = img.IMBD
    imageRate(img.rating)
    getMovieInfo(img.IMBD)
}


function imageRate(n) {
    resetStars()
    allStars.forEach((star)=>{
        const starNum = parseInt(star.id.replace("s",""), 10)
        if (starNum <= n) {
            star.src = './images/fullStar.png'
        }
    })
}


function resetStars(){
    allStars.forEach((star) =>{
        star.src ='./images/star.png'
    })
}

function addComment(e) {
    e.preventDefault()
    const li = document.createElement("li");
    li.innerText = usernameInput.value + " says: " + commentInput.value;
    commentList.append(li);
    persistComment(li.innerText)
    e.target.reset()
}

function persistStars(movie, num){
    const rating = { rating: num}
    fetch(`http://localhost:3000/images/${movie}`, {
        method: 'PATCH',
        headers: {"Content-Type": "application/json",
        Accept: "application/json"},
        body: JSON.stringify(rating)          
    })
    .then(resp => resp.json())
    .then(movie => imageRate(movie.rating))
}

function persistComment(content){
    fetch('http://localhost:3000/comments', {
        method: "POST",
        headers: {"Content-Type":"application/json",
        Accept:"application/json"},
        body: JSON.stringify({imageId: currentMovieNum, content: content})            
    })
}

getImage()


function postComments(comments) {
    commentList.replaceChildren()
    comments.forEach((comment)=>{
        const li = document.createElement("li")
        li.textContent = comment.content
        commentList.append(li)
    })
}

function getMovieInfo(movie){
    let url = `https://api.watchmode.com/v1/title/${movie}/details/?apiKey=BWN7PlyQHdXKacWeTRGyRkrOhSwpcT2XKLuEHgVC`
    
    fetch(url, { method: 'Get' })
    .then((res) => res.json())
    .then((json) => {
        plotTODOM(json)
        getSimilarTitles(json['similar_titles']);
    });
}



function getSimilarTitles (simTitles) {
    similarTitlesBox.replaceChildren()
    for(let i = 0; i < 3; i++){
        fetch(`https://api.watchmode.com/v1/title/${simTitles[i]}/details/?apiKey=BWN7PlyQHdXKacWeTRGyRkrOhSwpcT2XKLuEHgVC`, {method: 'GET'})
        .then(resp => resp.json())
        .then(movie => handleSimilarTitles(movie))
    }
}

function handleSimilarTitles(movie) {
    const li = document.createElement('li')
    const p = document.createElement('p')
    p.className = 'similar-movie-year'
    p.textContent = movie.year
    li.textContent = movie.title
    li.className = 'similarTitles'
    li.appendChild(p)
    similarTitlesBox.append(li)
}
const plot = document.getElementById('plot')

function plotTODOM(movie){
    console.log(movie)
    plot.textContent = movie['plot_overview']
}