// Searches posts and filters them with a function.
function searchPosts(search, filter) {
    if (search == s) {
        renderPosts(posts, filter); 
        return;
    }
    
    $.ajax({
        method: "GET",
        dataType: "json",
        url: '/api/search-posts',
        data: {query: search},
        success: (data) => {
            posts = data;
            s = search;
            renderPosts(posts, filter); 
        },
        error: (err) => {
            console.log(err);
        }
    });
}

$(document).ready(() => {
    // Get value from input fields
    $('#refine').click(() => {
        let name = $('#name').val();
        let urgency = parseInt($('#urgency').val()) || 0;
        let reputation = parseInt($('#reputation').val()) || 0;
        let service; 
        if ($('#service').is(':checked')) {
            // Is offering service
            service = true;
        } else {
            // Is requesting service
            service = false;
        }
        
        // Send above information to back-end and search through all posts to return matching ones
        
        searchPosts($('#search').val(), (post) => {
			console.log("1");
            if ((post.urgency == 0) != service) { // urgency = 0 are servicing
                return false;
            }
            if (post.rating < reputation) {
                return false;
            }
			console.log("2");
            if (post.urgency > 0 && post.urgency < urgency) {
                return false;
            }
			console.log("3");
            // Either last or first has some of arg
            if (name.length > 0 && !name.split(" ").some((arg) => post.firstname.includes(arg) || post.lastname.includes(arg))) {
                return false;
            }
            return true;
        });
    });
	
	$("#refine").click();
});

