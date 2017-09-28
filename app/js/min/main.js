closeForm.addEventListener('click', function() {
    VK.Auth.logout();
    title.classList.add('hidden');
    container.classList.add('hidden');
});

function api(method, params) {

    return new Promise((resolve, reject) => {
        VK.api(method, params, data => {
            if (data.error) {
                reject(new Error(data.error.error_msg));
            } else {
                resolve(data.response);
            }
        });
    });
}

const promise = new Promise((resolve, reject) => {
    VK.init({
        apiId: 6189169
    });
    VK.Auth.login(data => {
        if (data.session) {
            resolve(data);
        } else {
            reject(new Error('Не удалось авторизоваться'));
        }
    }, 8);
});

promise
    .then(() => {

        return api('users.get', { v: 5.68, name_case: 'gen' });
    })
    .then(data => {
        const [user] = data;
        userInfo.innerHTML = `Друзья ${user.first_name} ${user.last_name}`;

        return api('friends.get', { v: 5.68, fields: 'id, first_name, last_name, city, country, photo_50'});
    })
    .then(data => {
        createLists(data);
    })
    .catch(function (e) {
        console.log('Ошибка: ' + e.message);
    });

function createLists(data) {
    let friendsInList = [];
    let friendsIDs = JSON.parse(localStorage.getItem('friendsIDs'));
    let myFriends = data.items;

    myFriends = myFriends.filter((item) => {
        if (friendsIDs) {
            if(friendsIDs.indexOf(item.id.toString()) > -1) {
                friendsInList.push(item);

                return false;
            }
        }

        return true;
    });
    const templateLeft = document.querySelector('#left-template');
    let source = templateLeft.innerHTML;
    let render = Handlebars.compile(source);
    let template = render({ list: myFriends });
    let div = document.createElement('div');

    div.innerHTML = template;
    div.className = 'content__list';
    div.id = 'leftcontent';
    leftlist.appendChild(div);

    const templateRight = document.querySelector('#right-template');

    source = templateRight.innerHTML;
    render = Handlebars.compile(source);
    template = render({ list: friendsInList });
    div = document.createElement('div');
    div.innerHTML = template;
    div.className = 'content__list';
    div.id = 'rightcontent';
    rightlist.appendChild(div);
    addListeners();
}

function addListeners() {
    leftcontent.addEventListener('drop', dragDrop);
    leftcontent.addEventListener('dragover', dragOver);
    rightcontent.addEventListener('drop', dragDrop);
    rightcontent.addEventListener('dragover', dragOver);
}

function applyFilter(item, str) {
    let  fio = item.children[1].firstChild.textContent;
    if (fio.toLowerCase().indexOf(str.toLowerCase()) > -1)
        item.classList.remove('hidden');
    else
        item.classList.add('hidden');
}

document.addEventListener('input', (e) => {
    let searchStr = e.target.value.trim();
    let list = document.getElementById((e.target.id == 'leftsearch') ? 'leftcontent' : 'rightcontent').children;

    for (let i = 0; i < list.length; i++) {
        let item = list[i];

        applyFilter(item, searchStr);
    }
});

leftlist.addEventListener('click', (e) => {
    let target = e.target;

    if (target.tagName == 'SPAN') {
        target.className = 'fa fa-times';
        rightcontent.appendChild(target.parentElement.parentElement);
        applyFilter(target.parentElement.parentElement, rightsearch.value.trim());
    }
});
rightlist.addEventListener('click', (e) => {
    let target = e.target;

    if (target.tagName == 'SPAN') {
        target.className = 'fa fa-plus';
        leftcontent.appendChild(target.parentElement.parentElement);
        applyFilter(target.parentElement.parentElement, leftsearch.value.trim());
    }
});
saveBtn.addEventListener('click', () => {
    let friendsIDs = [];
    let friends =  rightcontent.children;

    for (let i = 0; i < friends.length; i++) {
        friendsIDs.push(friends[i].id);
    }
    localStorage.setItem('friendsIDs', JSON.stringify(friendsIDs));
});

let movableElement;

function dragStart(e) {
    e.dataTransfer.effectAllowed ='move';
    movableElement = e.target.closest(".content__item");

    return true;
}

function dragOver(e) {
    e.preventDefault();
}

function dragDrop(e) {
    let targetList = e.target.closest(".content__list");
    let sibling = e.target.closest(".content__item");

    targetList.insertBefore(movableElement, sibling);
    if (e.target.closest(".content__list").id == "leftcontent") {
        movableElement.lastElementChild.firstElementChild.className = 'fa fa-plus';
        applyFilter(movableElement, leftsearch.value.trim());
    } else if (e.target.closest(".content__list").id == "rightcontent") {
        movableElement.lastElementChild.firstElementChild.className = 'fa fa-times';
        applyFilter(movableElement, rightsearch.value.trim());
    }
    e.stopPropagation();

    return false;
}
