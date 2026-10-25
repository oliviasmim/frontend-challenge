import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { getState, resetState, update, type Scenario } from './store';

/** Ativa o MSW no navegador e expõe controles de cenário para demo e testes. */
export async function startMocks() {
  const worker = setupWorker(...handlers);
  await worker.start({ onUnhandledRequest: 'bypass', serviceWorker: { url: '/mockServiceWorker.js' } });
  (window as unknown as { __mocks: unknown }).__mocks = {
    reset: (scenario: Scenario = 'default') => resetState(scenario),
    setScenario: (scenario: Scenario) =>
      update((s) => { s.scenario = scenario; s.timeoutConsumed = false; }),
    state: () => getState(),
  };
}
