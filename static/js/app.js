var data;

function optionChanged(newValue) {
    // console.log(newValue)
    patientInfo(newValue)
    patientcharts(newValue)
}

function dropdownMenu(IDlist) {
    var selector = d3.select("#selDataset")
    IDlist.forEach(ID => {
        selector
            .append("option")
            .text(ID)
    });
    optionChanged(IDlist[0])
    // console.log(IDlist)
}

function patientInfo(ID) {
    var metadata = data.metadata.filter(obj => obj.id == ID)[0]
    var selector = d3.select("#sample-metadata")
    selector.html("")
    for (const [key, value] of Object.entries(metadata)) {
        selector
            .append("li")
            .text(`${key}: ${value}`);
        // console.log(`${key}: ${value}`);
        //console.log(metadata)
    }

}

function patientcharts(ID) {
    var samples = data.samples.filter(obj => obj.id == ID)[0]
    var bar_ids = samples.otu_ids.slice(0, 10).map((sample, i) => {
        var label = samples.otu_labels[i].split(";").reverse()[0]
        console.log(label)
        return `${sample}: ${label}`
    })
    console.log(samples)
    var bardata = [{
        type: 'bar',
        x: samples.sample_values.slice(0, 10).reverse(),
        y: bar_ids.reverse(),
        text: samples.otu_labels.slice(0, 10).reverse(),
        orientation: 'h'
    }];

    var barlayout = {
        yaxis: {
            automargin: true
        }
    }

    Plotly.newPlot('bar1', bardata, barlayout);

    var bubblename = samples.otu_labels.map((label) => {
        var labels = label.split(";")
        var genus_index = labels.length - 1
        if (genus_index >= 5) {
            return labels.slice(0, genus_index).join(";")
        }
        return labels.join(";")
    });

    var bubblevalues = samples.sample_values

    var OTUValues = {}

    bubblename.map((otu, i) => {
        if (OTUValues[otu]) {
            OTUValues[otu] += bubblevalues[i]
        } else {
            OTUValues[otu] = bubblevalues[i]
        }
    });
    console.log(OTUValues)

    var trace1 = {
        x: Object.values(OTUValues),
        y: Object.keys(OTUValues),
        mode: 'markers',
        marker: {
            size: Object.values(OTUValues).map(x=>x/10+5)
        }
    };

    var bubbledata = [trace1];

    var bubblelayout = {
        title: 'Count of Bacteria by Family - Selected Subject',
        showlegend: false,
        yaxis: {
            automargin: true
        },
        // height: 1000
    };

    Plotly.newPlot('bubble', bubbledata, bubblelayout);


}

function chartTop10OTU(samples) {
    var OTUValues = {}
    samples.forEach(sample => {
        sample.otu_ids.map((otu, i) => {
            if (OTUValues[otu]) {
                OTUValues[otu].total += sample.sample_values[i]
            } else {
                OTUValues[otu] = {
                    total: sample.sample_values[i],
                    genus: sample.otu_labels[i].split(";").reverse()[0]
                }
            }
        });
    });

    OTUValues = Object.entries(OTUValues).sort(compareNumbers).slice(0, 10).reverse()
    var otu_ids = []
    var genus = []
    var total = []
    OTUValues.forEach(arr => {
        otu_ids.push(`${arr[0]}: ${arr[1].genus}`)
        genus.push(arr[1].genus)
        total.push(arr[1].total)
    });
    var bardata = [{
        type: 'bar',
        x: total,
        y: otu_ids,
        text: genus,
        orientation: 'h'
    }];

    var barlayout = {
        yaxis: {
            automargin: true
        }
    }

    Plotly.newPlot('bar2', bardata, barlayout);
}


function compareNumbers(a, b) {
    return b[1].total - a[1].total;
}


d3.json("./samples.json").then(function (result) {
    data = result
    // console.log(result)
    dropdownMenu(data.names)
    chartTop10OTU(data.samples)

})


