function search_posts(search, filter) {
    if (search == s) {
        render_posts(filter); 
        return;
    }
    
    $.ajax({
        method: "GET",
        dataType: "json",
        url: '/api/search-posts',
        data: {query: search},
        success: function (data) {
            posts = data;
            s = search;
            render_posts(filter); 
        },
        error: function (err) {
            console.log(err);
        }
    });
}

$(document).ready(function() {
    // Get value from input fields
    $('#refine').click(function() {
        var name = $('#name').val();
        var urgency = parseInt($('#urgency').val()) || 0;
        var reputation = parseInt($('#reputation').val()) || 0;
        var service; 
        if ($('#service').is(':checked')) {
            // Is offering service
            service = true;
        } else {
            // Is requesting service
            service = false;
        }
        
        // Send above information to back-end and search through all posts to return matching ones
        
        search_posts($('#search').val(), (post) => {
            if ((post.urgency == 0) != service) { // urgency = 0 are servicing
                return false;
            }
            if (post.rating < reputation) {
                return false;
            }
            if (post.urgency > 0 && post.urgency < urgency) {
                return false;
            }
            // Either last or first has some of arg
            if (name.length > 0 && !name.split(" ").some((arg) => post.firstname.includes(arg) || post.lastname.includes(arg))) {
                return false;
            }
            return true;
        });
    });

    
    $('#refine').click();
});

