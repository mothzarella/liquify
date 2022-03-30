// customization

$.getJSON(dirname, liquidConfig);

function liquidConfig(json) {
    var config = {
        lazyLoadJson: json.theme.lazyLoad,
    }


    const root = document.documentElement;
    /*
    * colors
    */
    /*root.style.setProperty('--priary', json.colors.primary);
    root.style.setProperty('--opacity', json.theme.opacity);*/

    Object.keys(json.colors).forEach(function(key) {
        root.style.setProperty('--' + key, json.colors[key]);

        console.log(document.querySelectorAll('[bgColor="' + key + '"]'));

        document.querySelectorAll('[bgColor="' + key + '"]').forEach(elem => {
            elem.style.backgroundColor = "rgb(" + json.colors[key] + ")";
        });
    });

    /*
    * theme
    */

    //lazyLoad

    if (config.lazyLoadJson === true) {
        const images = document.querySelectorAll("[liquid-src]");
        const placeholderSize = document.querySelectorAll("[placeholder='size']");

        placeholderSize.forEach(elem => {
            //TODO: "Custom placeholder canvas"
            var imagesWidth = elem.offsetWidth;
            var imagesHeight = elem.offsetHeight;
            elem.style.backgroundImage = "url(" + 'https://dummyimage.com/' + imagesWidth + 'x' + imagesHeight + '/161b22/fff.svg' + ")";
        });

        function preloadImage(img) {
            const src = img.getAttribute("liquid-src");
            if (!src) {
                return;
            }

            img.src = src;
            img.setAttribute("liquid-src", null);
        }

        const imgOptions = {
            threshold: 0,
            rootMargin: "0px 0px 300px 0px"
        };

        const imgObserver = new IntersectionObserver((entries,
                                                      imgObserver) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    return;
                } else {
                    preloadImage(entry.target);
                    imgObserver.unobserve(entry.target)
                }
            })
        }, imgOptions);

        images.forEach(image => {
            imgObserver.observe(image);
        });
    }

    /*
    * extend
    */

    //fonts
    root.style.setProperty('--fontSans', json.extend.font.family.sans);
    root.style.setProperty('--fontSerif', json.extend.font.family.serif);
    root.style.setProperty('--fontMono', json.extend.font.family.mono);

    /*
    *   container
    */

    document.querySelectorAll(".container").forEach( elem => {
        //center
        if(json.theme.container.center === true) {
            elem.style = `
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            `;
        }
        //style
        elem.style = `
            padding: ${json.theme.container.padding}rem;
            margin: ${json.theme.container.margin}rem;
        `;

    });
}

//ripple

function createRipple(event) {
    const target = event.target;

    const circle = document.createElement("span");
    const diameter = Math.max(target.clientWidth, target.clientHeight);
    const radius = diameter / 2;

    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${x - radius}px`;
    circle.style.top = `${y - radius}px`;
    circle.classList.add("ripple");

    const ripple = target.getElementsByClassName("ripple")[0];

    if (ripple) {
        ripple.remove();
    }

    target.appendChild(circle);
}

const buttons = document.querySelectorAll("[liquid-button]");
for (const button of buttons) {
    button.addEventListener("click", createRipple);
}

//tooltip
var timer;
document.querySelectorAll("[liquid-tooltip]").forEach(elem => {
    const liquidTooltipX = elem.offsetWidth / 2;
    const liquidTooltipY = elem.offsetHeight / 2;
    let rect = elem.getBoundingClientRect();

    elem.addEventListener("mouseover", function (event) {
        createTooltip();
        if(timer) {
            clearTimeout(timer);
        }
    }, false);

    elem.addEventListener("mouseout", function (event) {
        document.querySelectorAll(".tooltip").forEach(elem => {
            timer = setTimeout(() => {
                elem.remove();
            }, 200);
        });
    }, false);

    function createTooltip() {
        //TODO: "Fixare tutto dio cane non funziona un cazzo e non capisco perchè"
        var tooltipX;
        var tooltipY;
        if(document.body.contains(document.querySelector(".tooltip"))) {
            const sesso = document.querySelector(".tooltip")
            const sessoX = sesso.offsetWidth / 2;
            const sessoY = sesso.offsetHeight;
            console.log(sessoX, sessoY);
            sesso.style.left = `${rect.x + liquidTooltipX - sessoX}px`;
            sesso.style.top = `${rect.y + liquidTooltipY - sessoY - 30}px`;
            sesso.innerHTML = elem.getAttribute("liquid-tooltip-content");
        } else {
            const image = document.createElement('div');
            image.className = "tooltip";
            image.innerHTML = elem.getAttribute("liquid-tooltip-content");
            document.body.appendChild(image)
            const lolX = image.offsetWidth / 2;
            const lolY = image.offsetHeight;
            console.log(lolX, lolY);
            image.style.left = `${rect.x + liquidTooltipX - lolX}px`;
            image.style.top = `${rect.y + liquidTooltipY - lolY - 30}px`;
        }
    }
});

// sidenav

document.querySelectorAll("[toggle-sidenav]").forEach(elem => {
    elem.addEventListener("click", () => {
        document.getElementById(elem.getAttribute("toggle-sidenav")).classList.toggle("liquid-toggle");
    });
});

// dropdown

document.addEventListener("click", e => {
    const isDropdownButton = e.target.closest("[liquid-drop-btn]")
    if (!isDropdownButton && e.target.closest("[liquid-drop]") != null) return
    let currentDropdown
    if (isDropdownButton) {
        currentDropdown = e.target.closest("[liquid-drop]")
        currentDropdown.classList.toggle("active")
    }
    document.querySelectorAll("[liquid-drop].active").forEach(dropdown => {
        if (dropdown === currentDropdown) return
        dropdown.classList.remove("active")
    })
});

// textarea

document.querySelectorAll("[liquid-textarea]").forEach(elem => {
    elem.setAttribute("contenteditable", "true");
});

// checkbox indeterminate

document.querySelectorAll("[liquid-indeterminate]").forEach(elem => {
    elem.indeterminate = true;
});

//player

function formatTime(timeInSeconds) {
    const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);
    return {
        hours: result.substr(0, 2) != "00" ? result.substr(0, 2) : "undefined",
        minutes: result.substr(3, 2),
        seconds: result.substr(6, 2),
    };
}

document.querySelectorAll("[liquid-video]").forEach(elem => {
    // elem.setAttribute("oncontextmenu", "return false");

    //video
    var lq_video = document.createElement('video');
    lq_video.setAttribute("controlslist", "nodownload");
    lq_video.src = elem.getAttribute("liquid-video");
    lq_video.className = 'liquid-video';

    elem.appendChild(lq_video);

    //interaction
    var liquidVideoInteraction = document.createElement('div');
    liquidVideoInteraction.className = 'liquid-video-interaction';

    elem.appendChild(liquidVideoInteraction);

    //controls
    var liquidVideoControls = document.createElement('div');
    liquidVideoControls.className = 'liquid-video-controls';

    elem.appendChild(liquidVideoControls);
    var videoControls = elem.querySelector(".liquid-video-controls");

    //play
    var liquidVideoPlay = document.createElement('button');
    liquidVideoPlay.className = 'liquid-video-buttons-play';

    videoControls.appendChild(liquidVideoPlay);

    //volume
    var liquidVideoVolume = document.createElement('div');
    liquidVideoVolume.className = 'liquid-video-volume';

    videoControls.appendChild(liquidVideoVolume);
    var videoVolume = elem.querySelector(".liquid-video-volume");

    videoVolume.innerHTML = '<button class="liquid-video-buttons-volume"></button><input class="liquid-video-input-volume" type="range" step="0.01" value="1" min="0" max="1" />';

    //progress
    var liquidVideoProgress = document.createElement('div');
    liquidVideoProgress.className = 'liquid-video-progress';

    videoControls.appendChild(liquidVideoProgress);
    var videoProgress = elem.querySelector(".liquid-video-progress");

    //progress value
    var liquidVideoSeek = document.createElement('div');
    liquidVideoSeek.className = 'liquid-video-seek';

    videoProgress.appendChild(liquidVideoSeek);
    var videoSeek = elem.querySelector(".liquid-video-seek");

    //time
    var liquidVideoTime = document.createElement('div');
    liquidVideoTime.className = 'liquid-video-time';

    videoControls.appendChild(liquidVideoTime);
    var videoTime = elem.querySelector(".liquid-video-time");

    //screen
    var liquidVideoScreen = document.createElement('button');
    liquidVideoScreen.className = 'liquid-video-buttons-screen';

    videoControls.appendChild(liquidVideoScreen);

    //video load
    window.onload = function () {
        if (window.sessionStorage.getItem("volValue")) {
            volume.value = window.sessionStorage.getItem("volValue")
            lq_video.volume = window.sessionStorage.getItem("volValue")
            updateVolumeIcon()
        }

        lq_video.addEventListener('timeupdate', function () {
            var duration = lq_video.duration;
            if (duration > -1) {
                if (seeking == false) {
                    elem.querySelector('.liquid-video-seek').style.width = ((lq_video.currentTime / duration) * 100) + "%";
                    const retime = formatTime(Math.round(lq_video.duration));
                    const time = formatTime(lq_video.currentTime);
                    videoTime.innerHTML = `${retime.hours}` != "undefined" ? `<span class="liquid-video-time-current">${time.hours}:${time.minutes}:${time.seconds}</span>/<span class="liquid-video-time-total">${retime.hours}:${retime.minutes}:${retime.seconds}</span>` : `<span class="liquid-video-time-current">${time.minutes}:${time.seconds}</span>/<span class="liquid-video-time-total">${retime.minutes}:${retime.seconds}</span>`;
                }
            }
        });

    }

    lq_video.addEventListener('loadeddata', function () {
        elem.querySelector('.liquid-video-seek').style.width = "0%";
        const retime = formatTime(Math.round(lq_video.duration));
        videoTime.innerHTML = `${retime.hours}` != "undefined" ? `<span class="liquid-video-time-current">00:00</span>/<span class="liquid-video-time-total">${retime.hours}:${retime.minutes}:${retime.seconds}</span>` : `<span class="liquid-video-time-current">00:00</span>/<span class="liquid-video-time-total">${retime.minutes}:${retime.seconds}</span>`;
    });

    //video play
    liquidVideoPlay.addEventListener('click', function () {
        if (lq_video.paused) {
            lq_video.play();
            liquidVideoPlay.classList.replace("liquid-video-buttons-play", "liquid-video-buttons-pause");
        } else {
            lq_video.pause();
            liquidVideoPlay.classList.replace("liquid-video-buttons-pause", "liquid-video-buttons-play");
        }
    });

    //video pause
    elem.querySelector('.liquid-video-interaction').addEventListener('click', function () {
        if (lq_video.paused || lq_video.ended) {
            lq_video.play();
            liquidVideoPlay.classList.replace("liquid-video-buttons-play", "liquid-video-buttons-pause");
        } else {
            lq_video.pause();
            liquidVideoPlay.classList.replace("liquid-video-buttons-pause", "liquid-video-buttons-play");
        }
    });

    //volume change
    $('.liquid-video-input-volume').on('input', function (e) {
        var volumeinputMin = e.target.min,
            volumeinputMax = e.target.max,
            volumeinputVal = e.target.value;

        $(e.target).css({
            'background': 'linear-gradient(90deg, #fff ' + parseInt((volumeinputVal - volumeinputMin) * 100 / (volumeinputMax - volumeinputMin)) + '%, #464649 0%)'
        });
    }).trigger('input');

    function updateVolumeIcon() {
        volumeIcons.forEach((icon) => {
            icon.classList.add('hidden');
        });

        if (lq_video.muted || lq_video.volume === 0) {
            volumeMute.classList.remove('hidden');
        } else if (lq_video.volume > 0 && lq_video.volume <= 0.5) {
            volumeLow.classList.remove('hidden');
        } else {
            volumeHigh.classList.remove('hidden');
        }
    }

    //Progressbar elements

    var sliderCanMove = false;
    var seeking = false;
    var touch;
    var pos_x;

    // videoProgress.addEventListener("mouseover", function () {
    //     document.getElementById("video-scrubber").classList.remove("video-scrubber-hide");
    // });

    // videoProgress.addEventListener("mouseleave", function () {
    //     document.getElementById("video-scrubber").classList.add("video-scrubber-hide");
    // });


    $(".liquid-video-progress").on("mousemove touchmove", function (e) {
        if (sliderCanMove) {
            seeking = true;
            touch = undefined
            if (e.originalEvent.touches) touch = e.originalEvent.touches[0];
            pos_x = touch ? touch.pageX : e.pageX;
            var offset = $(".liquid-video-progress").offset();
            var left = (pos_x - offset.left);
            var totalWidth = $(".liquid-video-progress").width();
            var percentage = (left / totalWidth);
            if (percentage > 1.0001) return;
            const retime = formatTime(Math.round(lq_video.duration));
            const time = formatTime(Math.round(lq_video.duration * percentage));
            videoTime.innerHTML = `${retime.hours}` != "undefined" ? `<span class="liquid-video-time-current">${time.hours}:${time.minutes}:${time.seconds}</span>/<span class="liquid-video-time-total">${retime.hours}:${retime.minutes}:${retime.seconds}</span>` : `<span class="liquid-video-time-current">${time.minutes}:${time.seconds}</span>/<span class="liquid-video-time-total">${retime.minutes}:${retime.seconds}</span>`;
            elem.querySelector('.liquid-video-seek').style.width = ((percentage) * 100) + "%";
        }
    });


    $(".liquid-video-progress").on("mousemove touchmove", function (e) {
        if (e.originalEvent.touches) touch = e.originalEvent.touches[0];
        pos_x = touch ? touch.pageX : e.pageX;
        var offset = $(".liquid-video-progress").offset();
        var left = (pos_x - offset.left);
        var totalWidth = $(".liquid-video-progress").width();
        var percentage = (left / totalWidth);
        // document.getElementById('seek-tooltip').style.display = "block";
        // if (percentage >= 1 || percentage < 0) return;
        // const retime = formatTime(Math.round(lq_video.duration * percentage));
        // document.getElementById("seek-tooltip").innerHTML = `${retime.hours}` != "undefined" ? `${retime.hours}:${retime.minutes}:${retime.seconds}` : `${retime.minutes}:${retime.seconds}`;
        // document.getElementById('seek-tooltip').style.left = left;
    });

    $(".liquid-video-progress").on("mouseleave touchend", function (e) {
        // document.getElementById('seek-tooltip').style.display = "none";
    });

    $(".liquid-video-progress").on("mouseup touchend", function (e) {
        sliderCanMove = false;
        if (seeking == true) {
            if (e.changedTouches) touch = e.changedTouches[0];
            pos_x = touch ? touch.pageX : e.pageX;
            var offset = $(".liquid-video-progress").offset();
            var left = (pos_x - offset.left);
            var totalWidth = $(".liquid-video-progress").width();
            var percentage = (left / totalWidth);
            var vidTime = lq_video.duration * percentage;
            if (percentage > 1.0001) return;
            lq_video.currentTime = vidTime;
            seeking = false;
        }
    });

    $(".liquid-video-progress").on("mousedown touchstart", function (e) {
        sliderCanMove = true;
        touch = undefined
        if (e.originalEvent.touches) touch = e.originalEvent.touches[0];
        pos_x = touch ? touch.pageX : e.pageX;
        var offset = $(this).offset();
        var left = (pos_x - offset.left);
        var totalWidth = $(".liquid-video-progress").width();
        var percentage = (left / totalWidth);
        var vidTime = lq_video.duration * percentage;
        lq_video.currentTime = vidTime;
    });

    //fullscreen
    liquidVideoScreen.addEventListener("click", function () {
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            liquidVideoScreen.classList.replace("liquid-video-buttons-screen", "liquid-video-buttons-fullscreen");
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { /* Safari */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE11 */
                elem.msRequestFullscreen();
            }
        } else {
            liquidVideoScreen.classList.replace("liquid-video-buttons-fullscreen", "liquid-video-buttons-screen");
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        }
    });
});

// var c = document.querySelectorAll('.card');

// for (var i = 0; i < c.length; i += 4) {
//     console.log(c[i]);
//     var y = c[i].offsetHeight;
//     console.log(y);

//     var lol = c[i].offsetWidth + "px";
//     console.log(lol);
// };

