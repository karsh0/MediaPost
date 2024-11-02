const profileImage = document.getElementById('profileImage');
const fileInput = document.getElementById('fileInput');
profileImage.src = localStorage.getItem("image"); 


profileImage.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      localStorage.setItem("image",e.target.result)
      profileImage.src = localStorage.getItem("image"); 
    };
    reader.readAsDataURL(file); 
  }
});