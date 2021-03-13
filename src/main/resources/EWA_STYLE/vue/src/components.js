Vue.component('ewa-item-span', {
	props: ['cfg'],
	template: '<span :id="cfg.NAME" :name="cfg.NAME" class="IX_SPAN">{{cfg.VAL}}</span>'
});
Vue.component('ewa-item-button', {
	props: ['cfg'],
	template: '<input type="button" :id="cfg.NAME" :name="cfg.NAME" class="IX_BUTTON" :value="cfg.DES" :onclick="cfg._ONCLICK">'
});
Vue.component('ewa-item-submit', {
	props: ['cfg'],
	template: '<input type="submit" :id="cfg.NAME" :name="cfg.NAME" class="IX_BUTTON" :value="cfg.DES" :onclick="cfg._ONCLICK">'
});
Vue.component('ewa-item-text', {
	props: ['cfg'],
	template: '<input type="text" :placeholder="cfg.MEMO" :id="cfg.NAME" :name="cfg.NAME" class="EWA_INPUT" :value="cfg.VAL">'
});
Vue.component('ewa-item-select', {
	props: ['cfg'],
	template: `<select :id="cfg.NAME" :name="cfg.NAME" class="EWA_SELECT">
	<template v-for="item in cfg.LST">
		<option :value="item.V" selected v-if="item.V === cfg.VAL">{{item.T}}</option>
		<option :value="item.V" v-else>{{item.T}}</option>
	</template>
</select>`
});
Vue.component('ewa-item-textarea', {
	props: ['cfg'],
	template: '<textarea :placeholder="cfg.MEMO" :id="cfg.NAME" :name="cfg.NAME" class="EWA_TEXTAREA">{{cfg.VAL}}</textarea>'
});
Vue.component('ewa-f-item', {
	props: ['cfg'],
	template: `
	<ewa-item-span v-if="cfg.TAG === 'span'" :cfg="cfg" />
	<ewa-item-text v-else-if="cfg.TAG === 'text'" :cfg="cfg" />
	<ewa-item-select v-else-if="cfg.TAG === 'select'" :cfg="cfg" />
	<ewa-item-textarea v-else-if="cfg.TAG === 'textarea'" :cfg="cfg" />
`
});
Vue.component('ewa-f-button', {
	props: ['cfg'],
	template: `
	<ewa-item-button v-show="cfg.TAG === 'button'" :cfg="cfg" />
	<ewa-item-submit v-show="cfg.TAG === 'submit'" :cfg="cfg" />
`
});

Vue.component('ewa-lf-th', {
	props: ['cfg', 'fnOrder'],
	template: `<td :class="cfg._className" v-show="cfg.TAG !== 'button'">
	<nobr :id="cfg.NAME" v-show="cfg.IS_ORDER">
		<a class="EWA_TD_HA" v-on:click="fnOrder" :field="cfg.NAME" >{{cfg.DES}}</a>
	</nobr>
	<nobr :id="cfg.NAME" v-show="!cfg.IS_ORDER">{{cfg.DES}}</nobr>
</td>`
});
Vue.component('ewa-lf-td', {
	props: ['cfg'],
	template: `
<td :class="cfg._className" v-show="cfg.TAG !== 'button'" :tt="cfg.TAG">
	<ewa-item-span v-if="cfg.TAG === 'span'" :cfg="cfg" />
	<ewa-item-button v-else-if="cfg.TAG === 'button'" :cfg="cfg" />
	<div v-else>{{cfg.VAL}}</div>
</td>`
});
 