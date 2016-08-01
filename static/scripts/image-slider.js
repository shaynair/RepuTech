// Dynamic image slider, slightly modified from W7 Lab 6: jQuery+ UI

function loadImageSlider(images, title = "RepuTech") {
    // Load the correct images
    
    if (!Array.isArray(images)) {
        // Placeholder images
        images = ["/assets/images/computer-2.jpg",
            "/assets/images/computer-3.jpg",
            "/assets/images/smartphone-1.jpg",
            "/assets/images/computer-1.jpg",
            "/assets/images/mac-1.jpg"
        ];
    }
    let $slider = $('<ul/>', {
        id: 'slider'
    });

    let leftOffset = 0;
    let firstSize = 60;
    let sizeEach = (100 - firstSize) / (images.length - 1);
    
    $.each( images, (index, item) => {
        let $li = $('<li/>', {
            style: "left: " + leftOffset + "%; width: " + sizeEach + "%",
            id: "li-"+index
        });
        
        let $img = $('<img/>', {
            src: item,
            alt: title
        });
        
        $li.append($img);
        $slider.append($li);
        
        leftOffset += (index == 0 ? firstSize : sizeEach);
    });
    
    // Append the slider <ul> to <section id="gallery">
    $("section#gallery").append($slider);
    
    // Since we want the first image to be bigger than the next two, we'll need to apply double the width.
    // Use the :first-child selector.
    
    $("section#gallery ul li:first-child").css({ "width": firstSize + "%" });
    
    // jQuery UI to create slider
    
    // Step size changes depending on how many images to display
    let step_size = 100 / (images.length - 1);
    let last_index = -1;
    
    let $controller = $( "<div/>", {
        id: "controller"
    })
    .slider({
        value: 0,
        min: 0,
        max: 100,
        step: step_size,
        slide: ( event, ui ) => {
            let slider_index = ui.value / step_size;
            let direction = "+";
            
            if ( last_index < slider_index ) // going right
                direction = "-";
            
            last_index = slider_index;
            
            // Store "showcased" element
            let $showcase = $("section#gallery ul li:first-child");
            if (direction == "+" ) $showcase = $("section#gallery ul li:last-child");
            
            (function() {
                // Animate the showcase:
                $showcase.animate({
                    left: direction+"=" + firstSize + "%",
                    width: firstSize + "%"
                }, { duration: 200, queue: true });
                
                // We animate the rest differently based on direction.
                if (direction == "-" ) {
                    // Move all items to the right of the showcase
                    $showcase.nextAll().each(function(index) {
                        let amount = sizeEach + "%";
                        if ( index === 0 ) amount = firstSize + "%";
                        
                        $(this).animate({
                            left: direction+"="+amount,
                            width: amount
                        }, { duration: 200, queue: true });
                    });
                } else {
                    // Move all items to the left of the showcase
                    $("section#gallery ul li:lt("+$showcase.index()+")").each(function(index) {
                        let offset = sizeEach + "%";
                        if ( index === 0 ) offset = firstSize + "%";
                        
                        let newW = sizeEach + "%";
                        
                        $(this).animate({
                            left: direction+"="+offset,
                            width: newW
                        }, { duration: 200, queue: true });
                    });
                }
            })();
            
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
