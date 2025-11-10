<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { useMainNavigationStore } from '@/stores/main-navigation';
import type { NavigationButton, Navigations } from '@/types/navigation';
import { useRouter } from 'vue-router';

const navigations = inject('navigations') as Navigations;
const mainNavigation = useMainNavigationStore();
const router = useRouter();

const props = defineProps<{
  button:NavigationButton
  buttonIndex:number,
  navigation: string,
}>();

const emit = defineEmits(['onSelect']);

let cssClasses = `${props.button.genericContent} ${props.navigation}`;

let transitionOrigin = 'center center';
if (props.navigation == 'bottom') {
  const totalButtons = navigations.bottom.length
  const transitionXOrigin = ( (props.buttonIndex * 20) + 10 ) + ( (100 - (totalButtons * 20) ) / 2); 
  transitionOrigin = `${transitionXOrigin}% 115%`;
} else if (props.navigation == 'rail') {
  transitionOrigin = 'left center';
} else if (props.navigation == 'desktop') {
  transitionOrigin = 'left top';
}

const Submenu = ref<HTMLElement | null>(null);

const buttonAction = () => {
  mainNavigation.activateButton(props.button.genericContent);
  if (props.button.hasSubmenu === true || ( props.button.stackedButtons && props.button.stackedButtons.length ) ) {
    mainNavigation.toggleSubmenu(props.button.genericContent);
  } else {
    if (props.button.routeName) {
      if (props.button.routeParams) {
        router.push({name: props.button.routeName, params: props.button.routeParams});
      } else {
        router.push({name: props.button.routeName});
      }
    } else if (props.button.route) {
      router.push(props.button.route);
    }
    mainNavigation.closeSubmenu();
  }
  emit('onSelect');
};

const submenuButtonAction = (submenuUrl: string) => {
  if (submenuUrl) {
    router.push(submenuUrl);
    mainNavigation.closeSubmenu();
  } else {
    mainNavigation.toggleSubmenu(props.button.genericContent);
  }
};

const stackButtonAction = (stackButton: NavigationButton) => {
  if (stackButton.routeName) {
    router.push({name: stackButton.routeName});
  } else if (stackButton.route) {
    router.push(stackButton.route);
  }
  
  mainNavigation.closeSubmenu();
};

onMounted( () => {
  if (Submenu.value) {
    Submenu.value.style.transformOrigin = transitionOrigin;
  }
});

</script>


<template>
  <div
    class="navbutton-container"
    :class="cssClasses"
  >
    <div
      v-if="button.hasSubmenu"
      ref="Submenu"
      class="mn-submenu bg-solid backdrop-filter"
      :class="{ open: mainNavigation.currentSubmenu === button.genericContent }"
    >
      <div
        v-for="(link, index) in button.submenuContent"
        :key="index"
        class="mn-submenu-entry cursor-pointer"
        @click="submenuButtonAction(link.url)"
      >
        {{ link.linkName }}
      </div>
    </div>
    <div
      v-if="button.stackedButtons && button.stackedButtons.length > 0"
      class="mn-stack"
      :class="{ open: mainNavigation.currentSubmenu === button.genericContent }"
    >
      <div
        v-for="(stackButton, index) in button.stackedButtons"
        :key="index"
      >
        <div
          v-if="stackButton.routeName || stackButton.route"
          class="stack-button bg-light backdrop-filter"
          @click="stackButtonAction(stackButton)"
        >
          <div class="navicon-container">
            <div class="navicon-indicator"></div>
            <component :is="stackButton.icon" :size="24" />
          </div>
          <div class="navbuttontext">
            {{ stackButton.text }}
          </div>
        </div>
      </div>
    </div>
    <div
      class="navbutton cursor-pointer"
      :class="{ active: mainNavigation.activeButton === button.genericContent }"
      @click="buttonAction"
    >
      <div class="navicon-container">
        <div class="navicon-indicator"></div>
        <component :is="button.icon" :size="24" />
      </div>
      <div class="navbuttontext">
        {{ button.text }}
      </div>
      <div class="navbutton-indicator"></div>
    </div>
  </div>
</template>

<style>
.navbutton-container {
  padding: 12px 0px 12px 0px;
  width: calc( (100vw - var(--size-md) - var(--size-md) ) / 5);
}

.navbutton {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  opacity: .7;
}

.navbutton-indicator {
  display: none;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: 15px;
  background: rgba(0,0,0, .1);
  transform: scale3d(0,0,0);
  transition: var(--transition-cubic);
  transform-origin: center center;
}

.navbutton.active {
  opacity: 1;
}

.navicon-container {
  position: relative;
  width: 60%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  
}

.navicon-indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: 15px;
  background: rgba(0,0,0, .1);
  transform: scale3d(0,0,0);
  transition: var(--transition-cubic);
  transform-origin: center center;
}

.navbutton.active .navicon-indicator{
  transform: scale3d(1,1,1);
}

.navbutton.active .navbutton-indicator{
  transform: scale3d(1,1,1);
}

.navbutton:hover {
  cursor:pointer;
}

.navbuttontext {
  font-size: 11px;
  font-family: 'UbuntuCondensed';
  text-align: center;
  height: 16px;
  text-overflow: ellipsis;
  overflow-x: hidden; 
  padding: 0px 4px;
  white-space: nowrap;
  width: calc( (100vw - var(--size-md) - var(--size-md) ) / 5);
}

.mn-submenu {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 75px;
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: var(--size-md);
  transition: var(--transition-cubic);
  transform: scale3d(0,0,0);
  opacity: 1;
}

.mn-submenu.open {
  transform: scale3d(1,1,1);
  opacity: 1;
}

.mn-submenu-entry {
  width: 100%;
  padding: 8px 0px;
}

.mn-stack {
  position: absolute;
  right: 0;
  bottom: 75px;
  transition: var(--transition-cubic);
  transform-origin: 50% 100%;
  transform: scale3d(0,0,0);
  display: flex;
  flex-direction: column-reverse;
  justify-content: center;
  align-items: center;
  gap: var(--size-md);
}

.mn-stack.open {
  transform: scale3d(1,1,1);
  opacity: 1;
}

.stack-button {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  height: var(--bottom-navigation-height);
  border-radius: var(--border-radius);
  cursor: pointer;
}

@media (min-width: 640px) {
}

@media (min-width: 768px) {
  .navbutton-container {
    position: relative;
    width: var(--navigation-rail-width);
    padding: 0;
  }
  .navbuttontext {
    width: 100%;
  }

  .mn-submenu {
    left: calc( var(--navigation-rail-width) + var(--size-md) );
    top: 10%;
    bottom: auto;
    min-width: 200px;
  }
}

@media (min-width: 1024px) {

}

@media (min-width: 1280px) {

  .navbutton-container.desktop .navbutton-indicator {
    display: block;
  }

  .navbutton-container.desktop .navicon-indicator {
    display: none;
  }

  .navbutton-container.desktop {
    width: auto;
    padding: 6px 0px;
  }

  .navbutton-container.desktop .navbutton {
    flex-direction: row;
    flex-wrap: nowrap;
  }

  .navbutton-container.desktop .navbuttontext {
    width: auto;
    font-size: 16px;
    height: auto;
    font-family: "Ubuntu";
    padding-right: 12px;
  }

  .navbutton-container.desktop .navicon-container {
    width: 48px;
  }

  .mn-submenu {
    left: 0;
    top: calc(var(--desktop-header-bar-height));
    bottom: auto;
    min-width: 200px;
  }
}

@media (min-width: 1536px) {
}
</style>