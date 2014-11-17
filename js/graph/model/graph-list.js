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
            "description": "An hour on github, visualization of events happened in one hour on 12 August 2014 on github",
            "thumbnail": "templates/images/visualization-of-an-hour-on-github.png",
            "htmlTitle": "an-hour-on-github",
            "tags": ["git"]
            }
        ],
            "tags": ["all", "stackoverflow", "filims", "git"]
        };
    return graphs;
});
