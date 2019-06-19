let iterations: number = 0
let resizeTimer = null

window.addEventListener(
  'DOMContentLoaded',
  (): void => {
    // console.log('loaded')

    init()
    // init() // TODO old
  },
)

// Init on resize
window.onresize = function () {
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }

  resizeTimer = setTimeout(function () {
    resizeTimer = null;
    runTests();
  }, 200);
};

const init = (): void => {
  displayInfo()
  refreshTests()

  userAgent()
  runTests()
}

const displayInfo = (): void => {
  document.querySelector('.js-info-button') &&
  document.querySelector('.js-info-button').addEventListener(
    'click',
    (e: Event): void => {
      e.preventDefault()
      document.querySelector('.js-info').classList.toggle('is-visible')
    }
  )
}

const userAgent = (): void => {
  if (document.querySelector('.js-useragent')) {
    document.querySelector('.js-useragent').innerHTML = navigator.userAgent;
  }
}

const refreshTests = (): void => {
  document.querySelector('.js-refresh') &&
  document.querySelector('.js-refresh').addEventListener(
    'click',
    (e): void => {
      e.preventDefault()

      runTests()
    }
  )
}

const runTests = (): void => {
  const width = document.documentElement.clientWidth
  const height = document.documentElement.clientHeight

  const lines = `
    <p class="result__line">width <strong>${width}px</strong></p>
    <p class="result__line">height <strong>${height}px</strong></p>
    <p class="result__line">device-width <strong>${screen.width}px</strong></p>
    <p class="result__line">device-height <strong>${screen.height}px</strong></p>
    <p class="result__line">device-pixel-ratio <strong>${window.devicePixelRatio || 'unsupported'}</strong></p>
    <p class="result__line">aspect-ratio <strong>${defineRatio(width, height)}</strong></p>
    <p class="result__line">device-aspect-ratio <strong>${defineRatio(screen.width, screen.height)}</strong></p>
    <p class="result__line">orientation <strong>${defineOrientation()}</strong></p>
    <p class="result__line">resolution <strong>${`~${window.devicePixelRatio * 96}dpi in CSS` || 'unsupported'}</strong></p>
    `

  if (document.querySelector('.js-data')) {
    document.querySelector('.js-data').innerHTML = lines
  }

  iterations +=1
  if (document.querySelector('.js-iterations')) {
    document.querySelector('.js-iterations').innerHTML = `(iteration: ${iterations})`
  }
}

const defineRatio = (w: number, h: number): string => {
  // Euclidean algorithm (GCD = Greatest Common Factor)
  const gcd = (a: number, b: number): number => {
    if (b === 0) {
      return a
    }
    return gcd(b, a % b)
  }

  if (w === h) {
    return '1/1'
  }

  // Make sure first value is always the larger number
  if (w < h) {
    [w, h] = [h, w]
  }

  const divisor = gcd(w, h)

  return `${w / divisor}/${h / divisor}`
}

const defineOrientation = (): string => {
  if (window.matchMedia("(orientation: portrait)").matches) {
    return 'portrait'
  }

  if (window.matchMedia("(orientation: landscape)").matches) {
    return 'landscape'
  }

  return 'unsupported'
}
