import fetch from 'node-fetch'

/*
curl http://localhost:3000/lists -X DELETE
curl http://localhost:3000/lists
curl http://localhost:3000/lists/5
curl http://localhost:3000/lists -X POST -H "Content-Type: application/json" -d "{\"name\": \"myList\", \"items\": []}"
curl http://localhost:3000/lists -X POST -H "Content-Type: application/json" -d "{\"name\": \"myList2\", \"items\": []}"
curl http://localhost:3000/lists
curl http://localhost:3000/lists/0
curl http://localhost:3000/lists/1
curl http://localhost:3000/lists/1 -X PUT -H "Content-Type: application/json" -d "{\"name\": \"a second list\", \"items\": []}"
curl http://localhost:3000/lists
*/

async function request(path, method, data) {
    const options = {}
    if (method != null) {
        options.method = method
    }
    if (data != null) {
        options.headers = {'Content-Type': 'application/json'}
        options.body = JSON.stringify(data)
    }
    return fetch(`http://localhost:3000${path}`, options)
}

function fail(message) {
    throw message
}

async function main() {
    // Clean up from previous runs
    const deleteAll = await request("/lists", "DELETE")

    // Check there are no current lists
    const getAllEmpty = await request("/lists")
    if (!getAllEmpty.ok) {
        fail("Couldn't get all lists")
    }
    const emptyList = await getAllEmpty.json()
    if (emptyList.length == null || emptyList.length != 0) {
        fail("It didn't return an empty list")
    }

    // Check we can't get a specific non-existent list
    const getNonExistent = await request("/lists/5")
    if (getNonExistent.ok) {
        fail("Able to get non-existent list")
    }

    // Add two lists
    const addList1 = await request("/lists", "POST", {name: "myList", items: []})
    if (!addList1.ok) {
        fail("Unable to create list 1")
    }
    const list1Id = (await addList1.json())._id
    const addList2 = await request("/lists", "POST", {name: "myList2", items: []})
    if (!addList2.ok) {
        fail("Unable to create list 2")
    }
    const list2Id = (await addList2.json())._id

    // Check the created lists are available
    const getTwoLists = await request("/lists")
    if (!getTwoLists.ok) {
        fail("Unable to get two lists")
    }
    const twoLists = await getTwoLists.json()
    if (twoLists.length == null || twoLists.length != 2 || twoLists[0].name == null || (twoLists[0].name != "myList" && twoLists[0].name != "myList2")) {
        fail("We didn't receive our two lists")
    }

    // Get our lists individually
    const getListTwo = await request(`/lists/${list2Id}`)
    if (!getListTwo.ok) {
        fail("Unable to get list two")
    }
    const listTwo = await getListTwo.json()
    if (listTwo.name == null || listTwo.items == null || listTwo._id == null || listTwo.name != "myList2") {
        fail("We didn't receive list two")
    }

    // Update a list
    const putUpdateList = await request(`/lists/${list2Id}`, "PUT", {name: "a second list"})
    if (!putUpdateList.ok) {
        fail("Couldn't update list 2")
    }
    const getAllLists = await request("/lists")
    if (!getAllLists.ok) {
        fail("Couldn't get all lists")
    }
    const allLists = await getAllLists.json()
    if (allLists.length != 2 || !allLists.some(l => l.name == "a second list")) {
        fail("We didn't get our updated lists")
    }

    console.log("Tests passed! 😃")
}

main()