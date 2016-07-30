// Dynamic image slider, slightly modified from W7 Lab 6: jQuery+ UI

function LoadImageSlider() {
    
    var pathname = window.location.pathname;
    // Check if pathname is index.html or a user's profile
    // Load the correct images
    
    // Placeholder images, pull user's images from database
    var images = [
        {
            "title": "Computer technician 2",
            "url": "../assets/images/computer-2.jpg"
        },
        {
            "title": "Computer help elderly",
            "url": "../assets/images/computer-3.jpg"
        },
        {
            "title": "Smartphone technician",
            "url": "../assets/images/smartphone-1.jpg"
        },
        {
            "title": "Computer technician",
            "url": "../assets/images/computer-1.jpg"
        },
        {
            "title": "Mac technician",
            "url": "../assets/images/mac-1.jpg"
        }
    ];

    var $slider = $('<ul/>', {
        id: 'slider'
    });

    var leftOffset = 0;
    
    $.each( images, function(index, item) {
        if ( index == 1 ) leftOffset += 250;
        
        var $li = $('<li/>', {
            style: "left: " + leftOffset + "px",
            id: "li-"+index
        });
        
        var $img = $('<img/>', {
            src: item.url,
            alt: item.title
        });
        
        $li.append($img);
        $slider.append($li);
        
        leftOffset += 250;
    });
    
    // Append the slider <ul> to <section id="gallery">
    $("section#gallery").append($slider);
    
    
    // Since we want the first image to be bigger than the next two, we'll need to apply double the width.
    // Use the :first-child selector.
    
    $("section#gallery ul li:first-child").css({ "width": "500px" });
    
    // jQuery UI to create slider
    
    // Step size changes depending on how many images to display
    var step_size = 50 - images.length * 5;
    var last_index = -1;
    
    var $controller = $( "<div/>", {
        id: "controller"
    })
    .slider({
        value: 0,
        min: 0,
        max: 100,
        step: step_size,
        slide: function( event, ui ) {
            var slider_index = ui.value / step_size;
            var direction = "+";
            
            if ( last_index < slider_index ) // going right
                direction = "-";
            
            last_index = slider_index;
            
            // Store "showcased" element
            var $showcase = $("section#gallery ul li:first-child");
            if (direction == "+" ) $showcase = $("section#gallery ul li:last-child");
            
            // First we animate, then we actually move elements around in the DOM.
            function animateItems() {
                // Animate the showcase:
                $showcase.animate({
                    left: direction+"=500",
                    width: 500
                }, { duration: 200, queue: true });
                
                // We animate the rest differently based on direction.
                if (direction == "-" ) {
                    // Move all items to the right of the showcase
                    $showcase.nextAll().each(function(index) {
                        var amount = "250";
                        if ( index === 0 ) amount = 500;
                        
                        $(this).animate({
                            left: direction+"="+amount,
                            width: amount
                        }, { duration: 200, queue: true });
                    });
                } else {
                    // Move all items to the left of the showcase
                    $("section#gallery ul li:lt("+$showcase.index()+")").each(function(index) {
                        var offset = "250";
                        if ( index === 0 ) var offset = 500;
                        
                        var newW = "250";
                        
                        $(this).animate({
                            left: direction+"="+offset,
                            width: newW
                        }, { duration: 200, queue: true });
                    });
                }
            }
            
            animateItems();
            
            if ( direction == "+") {
                $showcase.prependTo("section#gallery ul");
            }
            else {
                $showcase.appendTo("section#gallery ul");
            }
        }
    });
    
    $("section#gallery").append($controller);
    
}

$(document).ready(LoadImageSlider());
