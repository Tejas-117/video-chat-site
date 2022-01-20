const nameInput = document.querySelector("#name");
const submitBtns = document.querySelectorAll(".submitBtn");

function setName(event) {
  event.preventDefault();

  const name = event.target.value;
  localStorage.setItem("name", name);

  if (nameInput.value) {
    submitBtns.forEach((btn) => {
      btn.disabled = false;
    });
  } else {
    submitBtns.forEach((btn) => {
      btn.disabled = true;
    });
  }
}

// dynamically change background image
const backgrounds = [
  "url(/images/image1.webp)",
  "url(/images/image2.webp)",
  "url(/images/image3.webp)",
  "url(/images/image4.webp)",
];

let count = 0;
function changeBG() {
   count += 1;
   count = count % backgrounds.length;

   const bg = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), ${backgrounds[count]}`;
   document.body.style.backgroundImage = bg;
}

setInterval(changeBG, 3000)