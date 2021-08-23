/*
problem statement
-----------------
There is a map excerpt of a hilly landscape. We call it a mesh. The mesh is partitioned in triangles; we call them elements. For each element a scalar value is assigned, which represents the average spot height in this triangle as compared to the sea level.

Mesh definition: A mesh is a collection of elements and nodes. Each node is a location on the map, given as a 2-dimensional point. It has an identification number (ID), two coordinates and can serve as a vertex for an element. Every element has an ID and is defined by three vertices - by 3 node IDs. The mesh is something like what I sent you above. 

For a walking tour we would like to identify the view spots. A view spot is the element where the height reaches its local maxima, that is, all the neighboring elements are not higher. We consider two elements as neighbors if they share at least one node – vertex.

The task is as follows: Given a mesh and an integer number N, find the first N view spots ordered by the spot height starting from the highest to the lowest.
In the case when two or more connected elements have exactly the same value, only one of the elements should be reported as a view spot.

*/
const fs = require('fs'); // import to read the files, not needed if you use vanilla js
filePath = "json_data.json";
let elements = JSON.parse(fs.readFileSync(filePath)); // parse the file as json object

// helper sorting function
function sortObj(list, key) {
    function compare(a, b) {
        a = a[key];
        b = b[key];
        var type = (typeof(a) === 'string' ||
                    typeof(b) === 'string') ? 'string' : 'number';
        var result;
        if (type === 'string') result = a.localeCompare(b);
        else result = a - b;
        return result;
    }
    return list.sort(compare).reverse();
}

// this function takes a json object, returns [{element_id: element_id1, value: <number value>}, ...]
function localMaximaFromElements(elements)
{
    // adjacency list for each element
    var adjacencyList = new Object();
    // hashmap for values, O(1) access
    var valuesMap = new Object();
    // isConnected, if two elements are connected directly by some node
    var isConnected = new Object();

    // build up the adjacency list
    // nodes to element mapper, adjacency list will store: for each node, which elements are attached with this node
    for(let i = 0; i < elements["elements"].length; i++)
    {
        let nodes = elements["elements"][i]["nodes"];
        let elementId = elements["elements"][i]["id"];
        for(let j = 0; j < nodes.length; j++) // made it general, so it will work for nodes != 3
        {
            if(adjacencyList[nodes[j]] === undefined)
            {
                adjacencyList[nodes[j]] = []; //   if not defined yet, initialize an empty list
            }
            if(adjacencyList[nodes[j]] !== undefined)
            {
                adjacencyList[nodes[j]].push(elementId);
            }
            
        }
    }

    // create a hashmap of values
    for (let i = 0; i < elements["values"].length; i++)
    {
        let elementId = elements["values"][i]["element_id"];
        let valueE = elements["values"][i]["value"];
        valuesMap[elementId] = valueE;
    }

    // pre-processing done
    // print the adjacency list
    //console.log(adjacencyList);
    //console.log(valuesMap);

    // graph search
    // traverse each element, find all of it's neighbors, check for values, if it is the highest add it to local maxima
    var localMaxima = [];
    // traversal
    for(let i = 0; i < elements["elements"].length; i++)
    {
        let nodes = elements["elements"][i]["nodes"];
        let elementId = elements["elements"][i]["id"];
        let elementValue = valuesMap[elementId];
        let isLocalMaxima = true;

        for(let j = 0; j < nodes.length; j++) // made it general, so it will work for nodes != 3
        {
            // traverse all the elements on these nodes
            for(let k = 0; k < adjacencyList[nodes[j]].length; k++)
            {
                let cElementId = adjacencyList[nodes[j]][k];
                let cElementValue = valuesMap[cElementId];
                
                // build an edge
                isConnected[ [elementId, cElementId] ] = true;
                isConnected[ [cElementId, elementId] ] = true;
                
                if(cElementValue > elementValue)
                {
                    isLocalMaxima = false;
                }

            }
            
        }
        if(isLocalMaxima === true)
        {
            //console.log(elementId);
            //console.log(elementValue);
            localMaxima.push({
                "element_id": elementId,
                "value": elementValue
            })
        }
    }
    // sorting
    localMaximaSorted = sortObj(localMaxima, 'value');

    // final check
    let finalLocalMaxima = [];
    for (let i = 0; i < localMaximaSorted.length; i++)
    {
        if (i == localMaximaSorted.length - 1)
        {
            finalLocalMaxima.push(localMaximaSorted[i]);
            break;
        }
        if (localMaximaSorted[i]["value"] == localMaximaSorted[i+1]["value"])
        {
            let elementId1 = localMaximaSorted[i]["element_id"];
            let elementId2 = localMaximaSorted[i+1]["element_id"];
            if (isConnected[ [elementId1, elementId2] ] !== undefined)
            {
                if (isConnected[ [elementId1, elementId2] ] === true)
                {
                    i++; // skip, go to next one
                }
                else
                {
                    finalLocalMaxima.push(localMaximaSorted[i]);
                }
            }
            else
            {
                finalLocalMaxima.push(localMaximaSorted[i]);
            }

        }
        else
        {
            finalLocalMaxima.push(localMaximaSorted[i]);
        }

    }

    //console.log(finalLocalMaxima);
    return finalLocalMaxima;

}

var start = new Date().getTime();

let localMax = localMaximaFromElements(elements);
console.log(localMax);

var end = new Date().getTime();

console.log("Total time taken: " + (end - start) + "ms");