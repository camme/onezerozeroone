define(['nunt'], function() {

    nunt.on(nunt.READY, function() {

        //window.addEventListener('resize', resize, false);

        var logo = document.querySelector('.logo');
        var width = logo.offsetWidth;
        var startEm = 6.9;
        var startWidth = logo.offsetWidth;
        //logo.style.fontSize;

        //console.log(logo, logo.style);

        function resize() {

            var width = logo.offsetWidth;

            var em = width / startWidth * startEm;

            logo.style.fontSize = em + "em";
            //var ems = 

        }

        //resize();

    });

});
