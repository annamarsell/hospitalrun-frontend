import Ember from 'ember';
import FilterList from 'hospitalrun/mixins/filter-list';
import UserSession from 'hospitalrun/mixins/user-session';
export default Ember.Component.extend(FilterList, UserSession, {
  editImagingAction: 'editImaging',
  editLabAction: 'editLab',
  editMedicationAction: 'editMedication',
  newImagingAction: 'newImaging',
  newLabAction: 'newLab',
  newMedicationAction: 'newMedication',
  showDeleteImagingAction: 'showDeleteImaging',
  showDeleteLabAction: 'showDeleteLab',
  showDeleteMedicationAction: 'showDeleteMedication',
  sortBy: null,
  sortKey: null,
  sortDesc: false,
  orderTypeFilters: Ember.computed(function() {
    let i18n = this.get('i18n');
    return [
      i18n.t('components.patientOrders.labels.imagingOrderType').toString(),
      i18n.t('components.patientOrders.labels.labOrderType').toString(),
      i18n.t('components.patientOrders.labels.medicationOrderType').toString()
    ];
  }),

  canAddImaging: Ember.computed(function() {
    return this.currentUserCan('add_imaging');
  }),

  canAddLab: Ember.computed(function() {
    return this.currentUserCan('add_lab');
  }),

  canAddMedication: Ember.computed(function() {
    return this.currentUserCan('add_medication');
  }),

  canDeleteImaging: Ember.computed(function() {
    return this.currentUserCan('delete_imaging');
  }),

  canDeleteLab: Ember.computed(function() {
    return this.currentUserCan('delete_lab');
  }),

  canDeleteMedication: Ember.computed(function() {
    return this.currentUserCan('delete_medication');
  }),

  sortedOrders: Ember.computed('filteredList', 'sortBy', 'sortDesc', function() {
    let filteredList = this.get('filteredList');
    let sortDesc = this.get('sortDesc');
    let sortBy = this.get('sortBy');
    if (Ember.isEmpty(filteredList) || Ember.isEmpty(sortBy)) {
      return filteredList;
    }
    filteredList = filteredList.sort(function(a, b) {
      let compareA = a.get(sortBy);
      let compareB = b.get(sortBy);
      if (sortBy === 'orderType') {
        compareA = compareA.toString();
        compareB = compareB.toString();
      }
      if (sortDesc) {
        return Ember.compare(compareB, compareA);
      } else {
        return Ember.compare(compareA, compareB);
      }
    });
    this.set('sortKey', sortBy);
    return filteredList;
  }),

  i18n: Ember.inject.service(),
  visit: null,

  didReceiveAttrs() {
    this._super(...arguments);
    Ember.RSVP.hash({
      imaging: this.get('visit.imaging'),
      labs: this.get('visit.labs'),
      medication: this.get('visit.medication')
    }).then((results) => {
      let orderList = new Ember.A();
      let i18n = this.get('i18n');
      orderList.addObjects(results.imaging.map((item) => {
        item.set('orderType', i18n.t('components.patientOrders.labels.imagingOrderType'));
        item.set('name', item.get('imagingType.name'));
        item.set('dateProcessed', item.get('imagingDate'));
        this._setPermissions(item, 'canAddImaging', 'canDeleteImaging');
        return item;
      }));
      orderList.addObjects(results.labs.map((item) => {
        item.set('orderType', i18n.t('components.patientOrders.labels.labOrderType'));
        item.set('name', item.get('labType.name'));
        item.set('dateProcessed', item.get('labDate'));
        this._setPermissions(item, 'canAddLab', 'canDeleteLab');
        return item;
      }));
      orderList.addObjects(results.medication.map((item) => {
        item.set('orderType', i18n.t('components.patientOrders.labels.medicationOrderType'));
        item.set('name', item.get('medicationName'));
        item.set('dateProcessed', item.get('prescriptionDate'));
        item.set('result', '');
        item.set('notes', item.get('prescription'));
        this._setPermissions(item, 'canAddMedication', 'canDeleteMedication');
        return item;
      }));
      this.set('orderList', orderList);
      this.set('filteredList', orderList);
    });
  },

  _setPermissions(item, editPerm, deletePerm) {
    if (item.get('canEdit')) {
      if (this.get(editPerm)) {
        item.set('canEdit', true);
      }
      if (this.get(deletePerm)) {
        item.set('canDelete', true);
      }
    }
  },

  actions: {
    filter(filterBy, filterValue) {
      let orderList = this.get('orderList');
      orderList = this.filterList(orderList, filterBy, filterValue);
      this.set('filteredList', orderList);
    },

    newImaging() {
      this.sendAction('newImagingAction');
    },

    newLab() {
      this.sendAction('newLabAction');
    },

    newMedication() {
      this.sendAction('newMedicationAction');
    },

    editOrder(order) {
      let modelName = order.get('constructor.modelName').capitalize();
      this.sendAction(`edit${modelName}Action`, order);
    },

    showDeleteOrder(order) {
      let modelName = order.get('constructor.modelName').capitalize();
      this.sendAction(`showDelete${modelName}Action`, order);
    },

    sortByKey(sortBy, sortDesc) {
      this.setProperties({
        sortBy,
        sortDesc
      });
    }
  }

});
