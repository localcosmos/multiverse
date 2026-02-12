import { inject } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { useMainNavigationStore } from '@/stores/main-navigation';
import { useModalBottomSheet } from '@/stores/modal-bottomsheet';
import { useMapStore } from '@/stores/map';
import HomeView from '@/views/HomeView.vue';
import TextView from '@/views/template-content/TextView.vue';
import StoryView from '@/views/template-content/StoryView.vue';
import ArticleView from '@/views/template-content/ArticleView.vue';
import TaxonProfiles from '@/views/taxon-profiles/TaxonProfiles.vue';
import TaxonProfile from '@/views/taxon-profiles/TaxonProfile.vue';
import ObservationsHub from '@/views/observations/ObservationsHub.vue';
import MyObservations from '@/views/observations/MyObservations.vue';
import GlossaryView from '@/views/GlossaryView.vue';
import NatureGuidesList from '@/views/nature-guides/NatureGuidesList.vue';
import NatureGuide from '@/views/nature-guides/NatureGuide.vue';
import NatureGuideStart from '@/views/nature-guides/NatureGuideStart.vue';
import LegalPageView from '@/views/legal/LegalPageView.vue';
import NotFound from '@/views/NotFound.vue';
import MyAccount from '@/views/account/MyAccount.vue';
import RegistrationView from '@/views/account/RegistrationView.vue';
import RegistrationSuccessView from '@/views/account/RegistrationSuccessView.vue';
import UserDeletionSuccess from '@/views/account/UserDeletionSuccess.vue';
import PasswordReset from '@/views/account/PasswordReset.vue';
import CollectionView from '@/views/template-content/CollectionView.vue';
import ObservationFormView from '@/views/observations/ObservationFormView.vue';
import ObservationFormsList from '@/views/observations/ObservationFormsList.vue';
import PermissionDenied from '@/views/PermissionDenied.vue';
import EditObservation from '@/views/observations/EditObservation.vue';
import EditRemoteObservation from '@/views/observations/EditRemoteObservation.vue';
import MapView from '@/views/maps/MapView.vue';
import ObservationDetail from '@/views/observations/ObservationDetail.vue';
import UserDetail from '@/views/account/UserDetail.vue';
import PrivacySettings from '@/views/legal/PrivacySettings.vue';

import { useAuthStore } from '@/stores/auth';
import { usePermissionsStore } from '@/stores/permissions';
import { useModalsStore } from '@/stores/modals';

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean,
    requiresAccountFeature?: boolean,
    title?: string,
    showBackbutton: boolean,
    showObservationCTA?:boolean,
    deactivateMainMenuButton?: boolean,
    requiresCanUseDatasetsPermission?: boolean,
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      alias: '/index.html',
      meta: {
        showBackbutton: false,
        showObservationCTA: true,
      }
    },
    {
      path: '/pages/text/:slug',
      name: 'text',
      component: TextView,
      meta: {
        showBackbutton: true,
      }
    },
    {
      path: '/pages/story/:slug',
      name: 'story',
      component: StoryView,
      meta: {
        showBackbutton: true,
      }
    },
    {
      path: '/pages/article/:slug',
      name: 'article',
      component: ArticleView,
      meta: {
        showBackbutton: true,
      }
    },
    {
      path: '/pages/collection/:slug',
      name: 'collection',
      component: CollectionView,
      meta: {
        showBackbutton: true,
      }
    },
    {
      path: '/taxon-profiles',
      name: 'taxon-profiles',
      component: TaxonProfiles,
      meta: {
        title: 'pageTitles.TaxonProfiles',
        showBackbutton: false,
      }
    },
    {
      path: '/taxon-profiles/group/:slug',
      name: 'taxon-profiles-node',
      component: TaxonProfiles,
      meta: {
        showBackbutton: true,
      }
    },
    {
      path: '/observations',
      name: 'observations',
      component: ObservationsHub,
      meta: {
        title: 'pageTitles.ObservationsHub',
        showBackbutton: false,
        showObservationCTA: true,
        requiresAccountFeature: true,
      }
    },
    {
      path: '/observations/my-observations',
      name: 'my-observations',
      component: MyObservations,
      meta: {
        title: 'pageTitles.MyObservations',
        showBackbutton: true,
        requiresAuth: false,
        requiresAccountFeature: true,
        requiresCanUseDatasetsPermission: true,
      },
    },
    {
      path: '/observations/my-observations/edit/local/:uuid',
      name: 'edit-local-observation',
      component: EditObservation,
      meta: {
        title: 'pageTitles.EditObservation',
        showBackbutton: true,
        requiresAuth: false,
        requiresAccountFeature: true,
        requiresCanUseDatasetsPermission: true,
      },
    },
    {
      path: '/observations/my-observations/edit/remote/:uuid',
      name: 'edit-remote-observation',
      component: EditRemoteObservation,
      meta: {
        title: 'pageTitles.EditObservation',
        showBackbutton: true,
        requiresAuth: false,
        requiresAccountFeature: true,
        requiresCanUseDatasetsPermission: true,
      },
    },
    {
      path: '/taxon-profile/:slug',
      name: 'taxon-profile',
      component: TaxonProfile,
      meta: {
        showBackbutton: true,
      }
    },
    {
      path: '/taxon-profile/:slug/:morphotype',
      name: 'morphotype-profile',
      component: TaxonProfile,
      meta: {
        showBackbutton: true,
      }
    },
    {
      path: '/taxon-profile/generic/:nameUuid',
      name: 'taxon-profile-nameuuid',
      component: TaxonProfile,
      meta: {
        showBackbutton: true,
      }
    },
    {
      path: '/glossary',
      name: 'glossary',
      component: GlossaryView,
      meta: {
        title: 'pageTitles.Glossary',
        showBackbutton: false,
        showObservationCTA: false,
      }
    },
    {
      path: '/nature-guides',
      name: 'nature-guides-list',
      component: NatureGuidesList,
      meta: {
        title: 'pageTitles.NatureGuidesList',
        showBackbutton: false,
        showObservationCTA: false,
      }
    },
    {
      path: '/nature-guide/:guideSlug',
      name: 'nature-guide-start',
      component: NatureGuideStart,
      meta: {
        title: 'pageTitles.NatureGuide',
        showBackbutton: false,
        showObservationCTA: false,
      }
    },
    {
      path: '/nature-guide/:guideSlug/:nodeSlug',
      name: 'nature-guide',
      component: NatureGuide,
      meta: {
        title: 'pageTitles.NatureGuide',
        showBackbutton: true,
        showObservationCTA: false,
      }
    },
    {
      path: '/my-account',
      name: 'my-account',
      component: MyAccount,
      meta: {
        title: 'pageTitles.MyAccount',
        showBackbutton: true,
        requiresAuth: true,
        requiresAccountFeature: true,
      }
    },
    {
      path: '/account/register',
      name: 'register',
      component: RegistrationView,
      meta: {
        title: 'pageTitles.Register',
        showBackbutton: true,
        requiresAccountFeature: true,
      }
    },
    {
      path: '/account/register/success',
      name: 'registration-success',
      component: RegistrationSuccessView,
      meta: {
        title: 'pageTitles.RegisterSuccess',
        showBackbutton: true,
        requiresAccountFeature: true,
      }
    },
    {
      path: '/my-account/user-delete-success',
      name: 'user-delete-success',
      component: UserDeletionSuccess,
      meta: {
        title: 'pageTitles.UserDeletionSuccess',
        showBackbutton: true,
        requiresAccountFeature: true,
      }
    },
    {
      path: '/my-account/password-reset',
      name: 'password-reset',
      component: PasswordReset,
      meta: {
        showBackbutton: true,
        requiresAccountFeature: true,
      }
    },
    {
      path: '/user/detail/:uuid',
      name: 'user-profile',
      component: UserDetail,
      meta: {
        title: 'pageTitles.UserDetail',
        showBackbutton: true,
        requiresAuth: false,
        requiresAccountFeature: true,
      }
    },
    {
      path: '/observation-form',
      name: 'observation-form',
      component: ObservationFormView,
    },
    {
      path: '/observation-forms',
      name: 'observation-forms-list',
      component: ObservationFormsList,
    },
    {
      path: '/observation-form/:slug',
      name: 'observation-form-slug',
      component: ObservationFormView,
    },
    {
      path: '/observation-detail/:uuid',
      name: 'observation-detail',
      component: ObservationDetail,
      meta: {
        title: 'pageTitles.ObservationDetail',
        showBackbutton: true,
        requiresAuth: false,
      }
    },
    {
      path: '/map',
      name: 'map',
      component: MapView,
      beforeEnter: (to, from) => {
        const mapStore = useMapStore();
        if (from.name === 'observation-detail') {
          mapStore.setUseLastMapView(true);
        }
        else {
          mapStore.setUseLastMapView(false);
        }
      },
    },
    {
      path: '/permission-denied',
      name: 'permission-denied',
      component: PermissionDenied,
      meta: {
        showBackbutton: true,
      }
    },
    {
      path: '/legal/:id',
      name: 'legal',
      component: LegalPageView,
      meta: {
        showBackbutton: false,
        deactivateMainMenuButton: true,
      }
    },
    {
      path: '/privacy-settings',
      name: 'privacy-settings',
      component: PrivacySettings,
      meta: {
        title: 'pageTitles.PrivacySettings',
        showBackbutton: true,
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
      meta: {
        showBackbutton: true,
      }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      window.addEventListener('restore-scroll', () => {
        window.scrollTo(savedPosition.left, savedPosition.top);
      }, { once: true });
      return false;
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }
    window.addEventListener('restore-scroll', () => {
      window.scrollTo(0, 0);
    }, { once: true });
    return false;
  }
});

router.beforeEach((to, from) => {
  const mainNavigation = useMainNavigationStore();
  const modalBottomSheet = useModalBottomSheet();
  const modals = useModalsStore();
  const auth = useAuthStore();
  const permissions = usePermissionsStore();
  const accountsEnabled = inject('accountsEnabled', false);

  // Destroy the ModalBottomSheet if navigating to a new page
  if (to.name !== from.name || to.path !== from.path) {
    modalBottomSheet.destroy();
  }

  if (modals.hasOpenModal === true) {
    modals.closeModal();
  }

  if (to.meta.requiresCanUseDatasetsPermission === true && !permissions.canUseDatasets) {
    // Redirect to 404 if user does not have permission to use datasets
    return { name: 'permission-denied' };
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    auth.redirectAfterLogin = to.fullPath;
    // Open login modal (emit event or use a global state)
    window.dispatchEvent(new CustomEvent('open-login-modal'));
    // Prevent navigation
    return false;
  }
  
  if (to.name === 'home') {
    mainNavigation.activateButton('Home');
  } else if (to.meta.deactivateMainMenuButton === true) {
    mainNavigation.deactivateButton();
  }

  if (to.meta) {

    if (to.meta.requiresAccountFeature && accountsEnabled === false) {
      // Redirect to 404
      return { name: 'not-found' };
    }

    if (to.meta.title) {
      mainNavigation.setCurrentPageTitle(to.meta.title);
    } else {
      mainNavigation.removeCurrentPageTitle();
    }

    if (mainNavigation.observationCTA && (to.meta.showObservationCTA === true)){
      mainNavigation.observationCTAvisible = true;
    } else {
      mainNavigation.observationCTAvisible = false;
    }

    mainNavigation.setBackbutton(to.meta.showBackbutton);

    console.log('Navigating to:', to.fullPath, 'from:', from.fullPath);
 
  }
});

export default router
