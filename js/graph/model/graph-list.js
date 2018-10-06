define(function () {
    var graphs = {
        "graphList": [{
            "id": "g1",
            "title": "Relation between tags in stackoverflow",
            "description": "This graph shows the relation between first 60 tags and each tags first 60 related tags.",
            "thumbnail": "templates/images/stackoverflow-tag-relations.png",
            "htmlTitle": "stackoverflow-tag-relations",
            "tags": ["stackoverflow", "programming"]
        },
        {
            "id": "g2",
            "title": "Which is the trending tag last year?",
            "description": "You can sort the data in yearly wise by clicking on the bottom year tab. The tags will be rearranged in descending order",
            "thumbnail": "templates/images/stackoverflow-tag-trending-yearly.png",
            "htmlTitle": "stackoverflow-tag-trending-yearly",
            "tags": ["stackoverflow", "programming"]
        },
        {
            "id": "g3",
            "title": "How tags are growing ?",
            "description": "This graph shows the growth of tags in each month.The vertical position of circle represent the count of questions in a month.",
            "thumbnail": "templates/images/stackoverflow-tag-growth-rate-monthly.png",
            "htmlTitle": "stackoverflow-tag-growth-rate-monthly",
            "tags": ["stackoverflow", "programming"]
        },
        {
            "id": "g4",
            "title": "Did you code on last Christmas day ?",
            "description": "It’s the punch-card visualization of question asked in each day of November-December in 2013",
            "thumbnail": "templates/images/stackoverflow-questions-punchcard.png",
            "htmlTitle": "stackoverflow-questions-punchcard",
            "tags": ["stackoverflow", "programming"]
        },
        {
            "id": "g5",
            "title": "255 f**k in Pulp Fiction",
            "description": "The word 'fuck' is used 255 times in the filim Pulp Fiction , checkout the visualization to see when they are",
            "thumbnail": "templates/images/255-fuck-in-pulp-fiction.png",
            "htmlTitle": "pulp-fiction",
            "tags": ["filims"]
        },
        {
            "id": "g6",
            "title": "An hour on GitHub",
            "description": "An hour on github, visualization of events logged in one hour on 12 August 2014 on github.",
            "thumbnail": "templates/images/visualization-of-an-hour-on-github.png",
            "htmlTitle": "an-hour-on-github",
            "tags": ["github"]
        },
        {
            "id": "g7",
            "title": "A Day on GitHub",
            "description": "A day on github, visualization of events logged in a day on github.",
            "thumbnail": "templates/images/a-day-on-github.png",
            "htmlTitle": "a-day-on-github",
            "tags": ["github"]
        },
        {
            "id": "g8",
            "title": "27 Club Visualization",
            "description": "Visualization of 27 Club members, artists name mapped on timeline and cause of death",
            "thumbnail": "templates/images/visualization-27-Club.png",
            "htmlTitle": "27-club-visualization",
            "twitter": "<span class=\"twitter-btn\"> <a href=\"https://twitter.com/share\" class=\"twitter-share-button\" data-via=\"sarathsaleem\" data-hashtags=\"dataviz,infographics,27club\">Tweet</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script></span>",
            "tags": ["music"]
        },
        {
            "id": "g9",
            "title": "3D Periodic table of elements",
            "description": "A 3d visualization of periodic table. This 3d representation has a table view which shows initially and an atomic view. Click on each element to explore atomic view.",
            "thumbnail": "templates/images/3d-periodic-table.png",
            "htmlTitle": "3d-periodic-table",
            "twitter": "",
            "tags": ["science"],
            "tmpl": "fullscreen"
        },
        // {
        //     "id": "g10",
        //     "title": "A breif history of Kashmir",
        //     "description": "A breif history of Kashmir",
        //     "thumbnail": "templates/images/3d-periodic-table.png",
        //     "htmlTitle": "history-of-kashmir",
        //     "twitter": "",
        //     "tags": ["history"],
        //     "tmpl": "fullscreen"
        // },
        {
            "id": "g11",
            "title": "Kerala Flood 2018",
            "description": "Analysis of Kerala's 2018 rainfall data which resulted in heavy flooding",
            "thumbnail": "templates/images/kerala-flood-2018.png",
            "htmlTitle": "kerala-flood-2018",
            "twitter": "",
            "tags": ["news"],
            "tmpl": "fullscreen",
            "mobileCompatible": "true"
        }
        ],
        "tags": ["all", "stackoverflow", "filims", "github", "music", "science", "history", "news"]
    };
    return graphs;
});
