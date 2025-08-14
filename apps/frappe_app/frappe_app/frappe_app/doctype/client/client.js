// Copyright (c) 2025, Angelina and contributors
// For license information, please see license.txt

 frappe.ui.form.on("Client", {
    refresh: function(frm) {

        frm.add_custom_button(__('Получить адрес'), function() {
            frappe.call({
                method: "get_address_by_inn",
                doc: frm.doc,
                args: {
                    query: frm.doc.inn
                },
                callback: function(r) {
                    if(r.message){
                        frappe.msgprint(__('Ответ от сервера: ' + r.message.value));
                        set_selected_values(frm, r.message)
                    }
                }
            });
        });

        autofill_fields(frm, 'client_name');
        autofill_fields(frm, 'inn');
    }
});

function autofill_fields(frm, fieldname) {
    let req = frm.fields_dict[fieldname].$input;
    
    req.on('input', function() {
        let enteredData = req.val();
        if (enteredData.length < 3) return;

        frappe.call({
            method: "get_suggestions",
            doc: frm.doc,
            args: { 
                query: enteredData
            },
            callback: function(r) {
                if (!r.message) return;
                let responseArray = [];

                r.message.forEach(el => {
                    responseArray.push({
                        title: `${el.value} (${el.data.inn || ''})`,
                        client_name: el.value,
                        inn: el.data.inn,
                        kpp: el.data.kpp
                    })
                });

                show_hint(frm, req, responseArray);
            }
        });
    });
}

function show_hint(frm, req, responseArray) {
    $('.hint-class').remove();

    let list = $(`<ul 
                    class="hint-class list-unstyled" 
                    style=
                        "background:white;
                        position:absolute; 
                        z-index:1000; 
                        max-height:200px; 
                        overflow:auto; 
                        width:'+ ${req.outerWidth()} +'px;
                        top: ${req.offset().top + req.outerHeight()}px;
                        left: ${req.offset().left}px"
                ></ul>`);
    
    responseArray.forEach(res => {
        let listItem = $('<li style="padding:5px; cursor:pointer"></li>').text(res.title);
        listItem.on('click', function() {
            list.remove();
            set_selected_values(frm, res);
        });
        list.append(listItem);
    });

    $('body').append(list);

    $(document).on('click.hint', function(e) {
        console.log('e:', e)
        if (!$(e.target).closest('.hint-class').length && !$(e.target).is(req)) {
            $('.hint-class').remove();
            $(document).off('click.hint');
        }
    });
}

function set_selected_values(frm, values) {
    if(values.client_name)
        frm.set_value('client_name', values.client_name);
    if(values.inn)
        frm.set_value('inn', values.inn || '');
    if(values.kpp)
        frm.set_value('kpp', values.kpp || '');
    if(values.value){
        frm.set_value('address', values.value);
    } else {
        frm.set_value('address', '');
    }
    
}