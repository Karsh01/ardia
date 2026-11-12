import AppKit

struct ThemeGradient: Equatable {
  var colors: [SIMD4<Float>] = []
  var opacity: CGFloat = 1
  var baseAlpha: CGFloat = 0
  var grain: CGFloat = 0
  var texture = "grain"
  var appearance = "auto"
  var angle: CGFloat = ArcGradientLayer.defaultAngle

  var isEmpty: Bool { colors.isEmpty }

  static func parse(_ flat: [Double]) -> [SIMD4<Float>] {
    stride(from: 0, to: flat.count - 3, by: 4).prefix(3).map { (start: Int) -> SIMD4<Float> in
      let red = Float(flat[start])
      let green = Float(flat[start + 1])
      let blue = Float(flat[start + 2])
      let alpha = Float(flat[start + 3])
      return SIMD4<Float>(red, green, blue, alpha)
    }
  }

  var forcedAppearance: NSAppearance? {
    switch appearance {
    case "dark": return NSAppearance(named: .darkAqua)
    case "light": return NSAppearance(named: .aqua)
    default: return nil
    }
  }
}
