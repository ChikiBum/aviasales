
const formSearch = document.querySelector('.form-search'),
    inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
    dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
    inputCitiesTo = formSearch.querySelector('.input__cities-to'),
    dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
    inputDateDepart = formSearch.querySelector('.input__date-depart'),
    cheapestTicket = document.getElementById('cheapest-ticket'),
    otherCheapTickets = document.getElementById('other-cheap-tickets');

// database
const
    citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json',
    // citiesApi = 'dataBase/cities.json',
    proxy = 'https://cors-anywhere.herokuapp.com/',
    API_KEY = 'bc2258c66283743bc68c78a93ac5db3b', //key from https://www.travelpayouts.com/programs/100/tools/api
    calendar = 'http://min-prices.aviasales.ru/calendar_preload',
    MAX_COUNT = 10;

let city = [];

//Functions
const getData = (url, callback, reject = console.error) => {
    const request = new XMLHttpRequest();

    request.open('GET', url);

    request.addEventListener('readystatechange', () => {
        if (request.readyState !== 4) return;

        if (request.status === 200) {
            // console.log(request.response);
            callback(request.response);
        }
        else {
            reject(request.status)
        }
    });

    request.send();
}

const showCity = (input, list) => {
    list.textContent = '';
    if (input.value !== '') {
        const filterCity = city.filter((item) => {
            //console.log(item);
            const fixItem = item.name.toLocaleLowerCase();
            // return fixItem.includes(input.value.toLocaleLowerCase())
            return fixItem.startsWith(input.value.toLocaleLowerCase())
        });
        filterCity.forEach((item, index) => {
            //console.log(index);
            const li = document.createElement('li');
            li.classList.add('dropdown__city');
            li.textContent = item.name;
            li.setAttribute('tabindex', index);//to TAB focus
            //li.setAttribute('tabindex', 0);//to TAB focus
            list.append(li);
            // console.log(li);
        });
    };
};

const selectCity = (event, input, list) => {
    //  console.log(event.target)
    const target = event.target;
    if (target.tagName.toLocaleLowerCase() === 'li') {
        // console.log(target.tagName)
        input.value = target.textContent;
        list.textContent = '';
    };
};


//les4

const getNameCity = (code) => {
    const objCity = city.find((item) => item.code === code);
    return objCity.name;
};

const getDate = (date) => {
    return new Date(date).toLocaleString('ru', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getChanges = (num) => {
    if (num) {
        return num === 1 ? 'С одной пересадкой' : 'С двумя пересадками';
    }
    else {
        return 'Без пересадок';
    }
};

//https://www.aviasales.ru/search/SVX2905KGD1
const getLinkAviasales = (data) => {
    let link = 'https://www.aviasales.ru/search/';
    link += data.origin;
    const date = new Date(data.depart_date);
    const day = date.getDate();
    link += day < 10 ? '0' + day : day;
    const month = date.getMonth() + 1;
    link += month < 10 ? '0' + month : month;
    link += data.destination;
    link += '1';
    return link;
}

const createCard = (data) => {
    const ticket = document.createElement('article');
    ticket.classList.add('ticket');

    let deep = '';

    if (data) {
        deep = `
        <h3 class="agent">${data.gate}</h3>
        <div class="ticket__wrapper">
            <div class="left-side">
                <a href="${getLinkAviasales(data)}" target="_blank" class="button button__buy">Купить
                    за ${data.value}₽</a>
            </div>
            <div class="right-side">
                <div class="block-left">
                    <div class="city__from">Вылет из города
                        <span class="city__name">${getNameCity(data.origin)}</span>
                    </div>
                    <div class="date">${getDate(data.depart_date)}</div>
                </div>

                <div class="block-right">
                     <div class="changes">${getChanges(data.number_of_changes)}</div>
                    <div class="city__to">Город назначения:
                        <span class="city__name">${getNameCity(data.destination)}</span>
                    </div>
                </div>
            </div>
        </div> 
        `;
    }
    else {
        deep = '<h3> К сожалению билетов на указанную дату не обраружено</h3>'
    }

    ticket.insertAdjacentHTML('afterbegin', deep);

    cheapestTicket.style.color = ''

    return ticket;
};

//les3

const renderCheapDay = (cheapTicket) => {
    //les4
    cheapestTicket.style.display = 'block';
    //------------- Clear ticket card results form for new SUBMIT - Search
    cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';
    //-------------
    const ticket = createCard(cheapTicket[0]);

    cheapestTicket.append(ticket)
};

const renderCheapYear = (cheapTickets) => {
    otherCheapTickets.style.display = 'block';
    //------------- Clear ticket card results form for new SUBMIT - Search
    otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';
    //-------------
    cheapTickets.sort((a, b) => a.value - b.value);


    for (let i = 0; i < cheapTickets.length && i < MAX_COUNT; i++) {
        const ticket = createCard(cheapTickets[i]);
        otherCheapTickets.append(ticket);
    }
};

const renderCheap = (data, date) => {
    const cheapTicketYear = JSON.parse(data).best_prices;

    const cheapTicketDay = cheapTicketYear.filter((item) => {
        return item.depart_date === date;
    });
    renderCheapDay(cheapTicketDay);
    renderCheapYear(cheapTicketYear);
}

//events handler
inputCitiesFrom.addEventListener('input', () => {
    showCity(inputCitiesFrom, dropdownCitiesFrom)
});

inputCitiesTo.addEventListener('input', () => {
    showCity(inputCitiesTo, dropdownCitiesTo)
});
//--------------- click to add city to form ------------------//
dropdownCitiesFrom.addEventListener('click', (event) => {
    console.log(event);
    selectCity(event, inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesTo.addEventListener('click', (event) => {
    selectCity(event, inputCitiesTo, dropdownCitiesTo);
});


//--------------- Enter to add city to form ------------------//
(function () {
    dropdownCitiesFrom.addEventListener('keydown', function (e) {
        if (e.code === 'Enter') {
            selectCity(event, inputCitiesFrom, dropdownCitiesFrom);
        }
    });
})();


(function () {
    dropdownCitiesTo.addEventListener('keydown', function (e) {
        if (e.code === 'Enter') {
            console.log(e);
            selectCity(event, inputCitiesTo, dropdownCitiesTo);
        }
    });
})();

//--------------- navigate with key Up and DOWN  ------------------//
dropdownCitiesFrom.addEventListener('keydown', function (e) {
    if (e.code == 'ArrowDown' && dropdownCitiesFrom.querySelector(".dropdown__city:focus").nextElementSibling != null) {
        dropdownCitiesFrom.querySelector(".dropdown__city:focus").nextElementSibling.focus();
    }

    if (e.code == 'ArrowUp' && dropdownCitiesFrom.querySelector(".dropdown__city:focus").previousElementSibling != null) {
        dropdownCitiesFrom.querySelector(".dropdown__city:focus").previousSibling.focus();
    }
});

dropdownCitiesTo.addEventListener('keydown', function (e) {
    if (e.code == 'ArrowDown' && dropdownCitiesTo.querySelector(".dropdown__city:focus").nextElementSibling != null) {
        dropdownCitiesTo.querySelector(".dropdown__city:focus").nextElementSibling.focus();
    }

    if (e.code == 'ArrowUp' && dropdownCitiesTo.querySelector(".dropdown__city:focus").previousElementSibling != null) {
        dropdownCitiesTo.querySelector(".dropdown__city:focus").previousSibling.focus();
    }
});

//----------------- action ESC buttion in input ----// 

inputCitiesFrom.addEventListener('keydown', function (e) {
    if (e.code == 'Escape') {
        inputCitiesFrom.value = '';
        dropdownCitiesFrom.textContent='';
    }
});

inputCitiesTo.addEventListener('keydown', function (e) {
    if (e.code == 'Escape') {
        inputCitiesTo.value = '';
        dropdownCitiesTo.textContent='';
    }
});

//----------------- action ESC buttion in dropDown ----// 
dropdownCitiesFrom.addEventListener('keydown', function (e) {
    if (e.code == 'Escape') {
        inputCitiesFrom.value = '';
        dropdownCitiesFrom.textContent='';
        inputCitiesFrom.focus()
    }
});

dropdownCitiesTo.addEventListener('keydown', function (e) {
    if (e.code == 'Escape') {
        inputCitiesTo.value = '';
        dropdownCitiesTo.textContent='';
        inputCitiesTo.focus()
    } 
});


//les 3
formSearch.addEventListener('submit', (event) => {
    event.preventDefault();

    const cityFrom = city.find((item) => inputCitiesFrom.value === item.name),
        cityTo = city.find((item) => inputCitiesTo.value === item.name);

    const formData = {
        from: cityFrom,
        to: cityTo,
        when: inputDateDepart.value
    }

    // string format for requestdata give from API documentation
    // const requestdata = '?depart_date=' + formData.when +
    //     '&origin=' + formData.from +
    //     '&destination=' + formData.to +
    //     '&one_way=true&token=' + API_KEY;

    //Интерполяция того же что выше

    if (formData.from && formData.to) {
        const requestdata = `?depart_date=${formData.when}&origin=${formData.from.code}&destination=${formData.to.code}&one_way=true&token=API_KEY`;

        getData(calendar + requestdata, (response) => {
            renderCheap(response, formData.when);
        }, (error) => {
            //alert('В этом направлении нету билетов');
            const ticket = document.querySelectorAll('.ticket');
            //console.log(ticket);

            for (i = 0; i < ticket.length; i++) {
                ticket[i].parentNode.removeChild(ticket[i]);
            }

            cheapestTicket.innerHTML = `<h2>В этом направлении нету билетов</h2>`;
            cheapestTicket.style.color = 'red'
            otherCheapTickets.innerHTML = '<h2></h2>';

            console.log('Код Ошибка для разработчика:', error)
        });
    }
    else if (!formData.from) {
        const ticket = document.querySelectorAll('.ticket');
        //console.log(ticket);

        for (i = 0; i < ticket.length; i++) {
            ticket[i].parentNode.removeChild(ticket[i]);
        }

        cheapestTicket.innerHTML = `<h2>Eneter correct city FROM:<i style='color: red'>'${inputCitiesFrom.value}'</i> name </h2>`;
        //cheapestTicket.style.color = 'red'
        otherCheapTickets.innerHTML = '<h2></h2>';
    }
    else {
        const ticket = document.querySelectorAll('.ticket');
        //console.log(ticket);
        for (i = 0; i < ticket.length; i++) {
            ticket[i].parentNode.removeChild(ticket[i]);
        }

        cheapestTicket.innerHTML = `<h2>Eneter correct city TO:<i style='color: red'>'${inputCitiesTo.value}'</i> name</h2>`;
        //cheapestTicket.style.color = 'red'
        otherCheapTickets.innerHTML = '<h2></h2>';
    }
});

//call function
getData(proxy + citiesApi, (data) => {
    // console.log(JSON.parse(data));
    city = JSON.parse(data).filter((item) => {
        return item.name
    });

    city.sort((a, b) => {
        if (a.name > b.name) {
            return 1;
        }
        if (a.name < b.name) {
            return -1;
        }
        // a должно быть равным b
        return 0;
    });

});

// getData(citiesApi, (data) =>{
//     console.log(data)
// });