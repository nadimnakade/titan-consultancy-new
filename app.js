const video1 = document.getElementById('projectVideo1');
const video2 = document.getElementById('projectVideo2');
const video3 = document.getElementById('projectVideo3');

// Sidebar elements //
const sideBar = document.querySelector('.sidebar');
const menu = document.querySelector('.menu-icon');
const closeIcon = document.querySelector('.close-icon')


const hoverSign = document.querySelector('.hover-sign');

const videoList =[video1, video2, video3];

videoList.forEach (function(video){
    video.addEventListener("mouseover", function(){
        video.play()
        hoverSign.classList.add("active")
    })
    video.addEventListener("mouseout", function(){
    video.pause();
    hoverSign.classList.remove("active")
})
})

// Sidebar elements //
menu.addEventListener("click", function(){
    sideBar.classList.remove("close-sidebar")
    sideBar.classList.add("open-sidebar")
});

closeIcon.addEventListener("click", function(){
    sideBar.classList.remove("open-sidebar");
    sideBar.classList.add("close-sidebar");
    
})

// Close sidebar on link click and navigate
const sidebarLinks = document.querySelectorAll('.sidebar ul a');
sidebarLinks.forEach((link)=>{
    link.addEventListener('click',(e)=>{
        sideBar.classList.remove('open-sidebar');
        sideBar.classList.add('close-sidebar');
    })
});

// Pause autoplay videos when offscreen
const autoVideos = document.querySelectorAll('.back-vid, .blackhole-box video, .skills-video, .info-section video');
const observer = new IntersectionObserver((entries)=>{
  entries.forEach((entry)=>{
    const v = entry.target;
    if (entry.isIntersecting) {
      v.play().catch(()=>{});
    } else {
      v.pause();
    }
  });
}, { threshold: 0.25 });
autoVideos.forEach(v=>observer.observe(v));
