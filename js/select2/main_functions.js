function set_default_select2_categories(items, element_id, item_selected = null){
  $(element_id).val(null).trigger('change');
  console.log("item selected => " + item_selected);
  for (var id_item in items) {
    let selected = '';

    if(item_selected == null || items[id_item]['id'] == item_selected){
      selected = 'selected';
    }

    console.log(selected + " <= for " + items[id_item]['display_name']);
    categories = $("<option " + selected + " data-color='" + items[id_item]['color'] + "'></option>").val(items[id_item]['id']).text(items[id_item]['display_name']);

    $(element_id).append(categories).trigger('change');
  }

}
