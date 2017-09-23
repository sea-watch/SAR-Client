import { SarClientPage } from './app.po';

describe('sar-client App', function() {
  let page: SarClientPage;

  beforeEach(() => {
    page = new SarClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
