import * as dashboardView from '@console/shared/src/test-views/dashboard-shared.view';
import * as clusterDashboardView from '../../views/dashboard.view';
import * as sideNavView from '../../views/sidenav.view';

const inventoryItems = [
  { title: 'Node', link: '/k8s/cluster/nodes' },
  { title: 'Pod', link: '/k8s/all-namespaces/pods' },
  { title: 'Storage Class', link: '/k8s/cluster/storageclasses' },
  { title: 'PVC', link: '/k8s/all-namespaces/persistentvolumeclaims' },
];

const utilizationItems = ['CPU', 'Memory', 'Filesystem', 'Network Transfer', 'Pod count'];

const checkDetailsItem = (item, value, expectedText: string, allowNotAvailable?: boolean) => {
  expect(item.getText()).toEqual(expectedText);
  const text = value.getText();
  expect(text.length).not.toBe(0);
  if (!allowNotAvailable) {
    expect(text).not.toBe('Not available');
  }
};

describe('Cluster Dashboard', () => {
  beforeAll(async () => {
    await sideNavView.clickNavLink(['Home', 'Overview']);
    await dashboardView.isLoaded();
  });

  describe('Details Card', () => {
    it('has all fields populated', async () => {
      expect(clusterDashboardView.detailsCard.isDisplayed()).toBe(true);
      const items = clusterDashboardView.detailsCardList.$$('dt');
      const values = clusterDashboardView.detailsCardList.$$('dd');

      expect(items.count()).toBe(5);
      expect(values.count()).toBe(5);
      checkDetailsItem(items.get(0), values.get(0), 'Cluster API Address');
      checkDetailsItem(items.get(1), values.get(1), 'Cluster ID');
      checkDetailsItem(items.get(2), values.get(2), 'Provider');
      checkDetailsItem(items.get(3), values.get(3), 'OpenShift Version');
      checkDetailsItem(items.get(4), values.get(4), 'Update Channel', true);
    });
    it('has View settings link', () => {
      const link = clusterDashboardView.detailsCard.$('[href="/settings/cluster/"]');
      expect(link.isDisplayed()).toBe(true);
      expect(link.getText()).toEqual('View settings');
    });
  });

  describe('Status Card', () => {
    it('has View alerts link', () => {
      expect(clusterDashboardView.statusCard.isDisplayed()).toBe(true);
      const link = clusterDashboardView.statusCard.$('[href="/monitoring/alerts"]');
      expect(link.isDisplayed()).toBe(true);
      expect(link.getText()).toEqual('View alerts');
    });
    it('has health indicators', () => {
      const items = clusterDashboardView.statusCard.$$('.co-status-card__health-item');
      expect(items.get(0).getText()).toEqual('Cluster');
      expect(items.get(1).getText()).toMatch('Control Plane.*');
      expect(items.get(2).getText()).toMatch('Operators.*');
    });
  });

  describe('Inventory Card', () => {
    it('has all items', async () => {
      expect(clusterDashboardView.inventoryCard.isDisplayed()).toBe(true);
      inventoryItems.forEach((item) => {
        const link = clusterDashboardView.inventoryCard.$(`[href="${item.link}"]`);
        expect(link.isDisplayed()).toBe(true);
        expect(link.getText()).toMatch(`^[0-9]* ${item.title}?.*`);
      });
    });
  });

  describe('Utilization Card', () => {
    it('has all items', () => {
      expect(clusterDashboardView.utilizationCard.isDisplayed()).toBe(true);
      const items = clusterDashboardView.utilizationItems;
      expect(items.count()).toBe(utilizationItems.length);
      utilizationItems.forEach((item, index) =>
        expect(
          items
            .get(index)
            .$('h4')
            .getText(),
        ).toEqual(item),
      );
    });
    it('has duration dropdown', () => {
      expect(clusterDashboardView.durationDropdown.isDisplayed()).toBe(true);
      expect(clusterDashboardView.durationDropdown.getText()).toEqual('1 Hour');
    });
  });

  describe('Activity Card', () => {
    it('has View events link', () => {
      expect(clusterDashboardView.activityCard.isDisplayed()).toBe(true);
      const link = clusterDashboardView.activityCard.$('[href="/k8s/all-namespaces/events"]');
      expect(link.isDisplayed()).toBe(true);
      expect(link.getText()).toEqual('View events');
    });
    it('has Pause events button', async () => {
      const button = clusterDashboardView.eventsPauseButton;
      expect(button.isDisplayed()).toBe(true);
      expect(button.getText()).toEqual('Pause');
      await button.click();
      expect(button.getText()).toEqual('Resume');
    });
  });
});
