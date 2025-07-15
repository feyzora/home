window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    const alldoc = document.getElementById('alldoc');

    if (preloader && alldoc) {
        setTimeout(function() {
            preloader.classList.add('fade-out');

            preloader.addEventListener('transitionend', function() {
                preloader.style.display = 'none';
                alldoc.classList.add('fade-in-content'); 
            }, { once: true }); 
        }, 1800); 
    }
});