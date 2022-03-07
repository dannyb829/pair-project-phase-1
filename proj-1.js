const thoughtsForm = document.querySelector('#thoughts-form')
const imageBox = document.getElementById('image-box')
let imageCount = 0
const cycleButton = document.getElementById('change-movie')
const movieTextHeader = document.getElementById('movie-title')
const usernameInput = document.getElementById("username-input");
const commentInput = document.getElementById("comment-input");
const commentList = document.getElementById("comment-list");
const allStars = document.querySelectorAll('.rating-star')

thoughtsForm.addEventListener('submit',(e) => addComment(e))


allStars.forEach(star => star.addEventListener('click', (e) => {
     const star = e.target
     const num = parseInt(star.id.replace("s",""), 10)
     imageRate(num)
}))


thoughtsForm.addEventListener('submit', e => {
    e.preventDefault()

})

cycleButton.addEventListener('click', getImage)

function getImage(){
    imageCount += 1
    if (imageCount >= 10) {
        imageCount = 1
    } 
    fetch(`http://localhost:3000/images/${imageCount}`)
    .then(resp => resp.json())
    .then(img => postImage(img))
} 

function postImage(img){
    imageBox.src = img.gifURL
    movieTextHeader.textContent = img.title
    imageRate(img.rating)
}


function imageRate(n) {
    resetStars()
    allStars.forEach((star)=>{
        const starNum = parseInt(star.id.replace("s",""), 10)
        if (starNum <= n) {
            star.src = './images/fullStar.png'
        }
    })
    persistStars()
}


function resetStars(){
    allStars.forEach((star) =>{
        star.src ='./images/star.png'
    })
}

function addComment(e) {
    e.preventDefault()
    const li = document.createElement("li");
    li.innerText = usernameInput.value + ": " + commentInput.value;
    commentList.append(li);
}

function persistStars(){
    const stars = Array.from(allStars).filter(star => star.src === 'http://127.0.0.1:5500/images/fullStar.png').length
    
}

getImage()


// fetch('https://tastedive.com/api/similar?=dark+knight')
// .then(resp => resp.json())
// .then(data => console.log(data)) 