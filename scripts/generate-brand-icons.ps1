# Gera a marca do Brain Versus Brain (BVB): logo-fonte em 1024px, ícones do PWA
# (180/192/512) e o favicon. Desenho vetorial (WPF), sem depender de arte externa.
# Uso (na raiz do projeto): powershell -NoProfile -ExecutionPolicy Bypass -File scripts/generate-brand-icons.ps1
Add-Type -AssemblyName PresentationCore, PresentationFramework, WindowsBase

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path '.').Path

function New-Color([string]$hex) {
  return [System.Windows.Media.ColorConverter]::ConvertFromString($hex)
}

# Desenha o ícone num quadrado de lado $size e devolve o bitmap WPF.
function New-BrandBitmap([int]$size) {
  $visual = New-Object System.Windows.Media.DrawingVisual
  $dc = $visual.RenderOpen()
  try {
    $s = [double]$size
    # Fundo: gradiente "hero" do app (violeta -> roxo -> rosa), cantos arredondados.
    $grad = New-Object System.Windows.Media.LinearGradientBrush
    $grad.StartPoint = New-Object System.Windows.Point(0, 0)
    $grad.EndPoint = New-Object System.Windows.Point(1, 1)
    $grad.GradientStops.Add((New-Object System.Windows.Media.GradientStop((New-Color '#6a4cf5'), 0.0)))
    $grad.GradientStops.Add((New-Object System.Windows.Media.GradientStop((New-Color '#b13fe0'), 0.52)))
    $grad.GradientStops.Add((New-Object System.Windows.Media.GradientStop((New-Color '#ff4fb4'), 1.0)))
    $radius = $s * 0.22
    $dc.DrawRoundedRectangle($grad, $null, (New-Object System.Windows.Rect(0, 0, $s, $s)), $radius, $radius)

    # Brilho sutil no topo.
    $shine = New-Object System.Windows.Media.LinearGradientBrush
    $shine.StartPoint = New-Object System.Windows.Point(0.5, 0)
    $shine.EndPoint = New-Object System.Windows.Point(0.5, 1)
    $shine.GradientStops.Add((New-Object System.Windows.Media.GradientStop([System.Windows.Media.Color]::FromArgb(70, 255, 255, 255), 0.0)))
    $shine.GradientStops.Add((New-Object System.Windows.Media.GradientStop([System.Windows.Media.Color]::FromArgb(0, 255, 255, 255), 0.55)))
    $dc.DrawRoundedRectangle($shine, $null, (New-Object System.Windows.Rect(0, 0, $s, $s)), $radius, $radius)

    # Cérebro (ícone "brain" do lucide, 24x24) em branco, na parte de cima.
    $brainPaths = @(
      'M12 18V5',
      'M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4',
      'M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5',
      'M17.997 5.125a4 4 0 0 1 2.526 5.77',
      'M18 18a4 4 0 0 0 2-7.464',
      'M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517',
      'M6 18a4 4 0 0 1-2-7.464',
      'M6.003 5.125a4 4 0 0 0-2.526 5.77'
    )
    $iconSide = $s * 0.46
    $scale = $iconSide / 24.0
    $offsetX = ($s - $iconSide) / 2.0
    $offsetY = $s * 0.085
    $group = New-Object System.Windows.Media.TransformGroup
    $group.Children.Add((New-Object System.Windows.Media.ScaleTransform($scale, $scale)))
    $group.Children.Add((New-Object System.Windows.Media.TranslateTransform($offsetX, $offsetY)))
    $pen = New-Object System.Windows.Media.Pen([System.Windows.Media.Brushes]::White, (2.1 * $scale))
    $pen.StartLineCap = [System.Windows.Media.PenLineCap]::Round
    $pen.EndLineCap = [System.Windows.Media.PenLineCap]::Round
    $pen.LineJoin = [System.Windows.Media.PenLineJoin]::Round
    $shadowPen = New-Object System.Windows.Media.Pen((New-Object System.Windows.Media.SolidColorBrush([System.Windows.Media.Color]::FromArgb(90, 40, 12, 90))), (2.1 * $scale))
    $shadowPen.StartLineCap = $pen.StartLineCap
    $shadowPen.EndLineCap = $pen.EndLineCap
    $shadowPen.LineJoin = $pen.LineJoin
    foreach ($d in $brainPaths) {
      $geometry = [System.Windows.Media.Geometry]::Parse($d).Clone()
      $shadowGroup = New-Object System.Windows.Media.TransformGroup
      $shadowGroup.Children.Add((New-Object System.Windows.Media.ScaleTransform($scale, $scale)))
      $shadowGroup.Children.Add((New-Object System.Windows.Media.TranslateTransform($offsetX, ($offsetY + $s * 0.012))))
      $shadowGeometry = $geometry.Clone()
      $shadowGeometry.Transform = $shadowGroup
      $dc.DrawGeometry($null, $shadowPen, $shadowGeometry)
      $geometry.Transform = $group
      $dc.DrawGeometry($null, $pen, $geometry)
    }

    # "BVB" em letras grossas, com sombra.
    $typeface = New-Object System.Windows.Media.Typeface(
      (New-Object System.Windows.Media.FontFamily('Segoe UI Black, Arial Black, Segoe UI')),
      [System.Windows.FontStyles]::Normal,
      [System.Windows.FontWeights]::Black,
      [System.Windows.FontStretches]::Normal
    )
    $fontSize = $s * 0.30
    $culture = [System.Globalization.CultureInfo]::GetCultureInfo('pt-BR')
    $shadowBrush = New-Object System.Windows.Media.SolidColorBrush([System.Windows.Media.Color]::FromArgb(110, 40, 12, 90))
    $text = New-Object System.Windows.Media.FormattedText('BVB', $culture, [System.Windows.FlowDirection]::LeftToRight, $typeface, $fontSize, [System.Windows.Media.Brushes]::White, 1.0)
    $textShadow = New-Object System.Windows.Media.FormattedText('BVB', $culture, [System.Windows.FlowDirection]::LeftToRight, $typeface, $fontSize, $shadowBrush, 1.0)
    $textX = ($s - $text.Width) / 2.0
    $textY = $s * 0.555
    $dc.DrawText($textShadow, (New-Object System.Windows.Point($textX, ($textY + $s * 0.018))))
    $dc.DrawText($text, (New-Object System.Windows.Point($textX, $textY)))
  }
  finally {
    $dc.Close()
  }

  $bitmap = New-Object System.Windows.Media.Imaging.RenderTargetBitmap($size, $size, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
  $bitmap.Render($visual)
  return $bitmap
}

function Get-PngBytes($bitmap) {
  $encoder = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
  $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($bitmap))
  $stream = New-Object System.IO.MemoryStream
  try {
    $encoder.Save($stream)
    return $stream.ToArray()
  }
  finally {
    $stream.Dispose()
  }
}

function Save-Png([int]$size, [string[]]$relativePaths) {
  $bytes = Get-PngBytes (New-BrandBitmap $size)
  foreach ($relativePath in $relativePaths) {
    $outPath = Join-Path $root $relativePath
    $dir = Split-Path $outPath -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
    [System.IO.File]::WriteAllBytes($outPath, $bytes)
  }
}

# Logo-fonte e ícones do PWA (a pasta icons/ guarda a fonte; public/icons é servida).
Save-Png 1024 @('icons/bvb-logo.png', 'public/icons/bvb-logo.png')
foreach ($size in @(180, 192, 512)) {
  Save-Png $size @("icons/icon-$size.png", "public/icons/icon-$size.png")
}

# favicon.ico com imagens PNG embutidas (16, 32 e 48 px).
$icoSizes = @(16, 32, 48)
$images = @()
foreach ($size in $icoSizes) { $images += , (Get-PngBytes (New-BrandBitmap $size)) }
$ico = New-Object System.IO.MemoryStream
$writer = New-Object System.IO.BinaryWriter($ico)
try {
  $writer.Write([UInt16]0)
  $writer.Write([UInt16]1)
  $writer.Write([UInt16]$icoSizes.Count)
  $offset = 6 + (16 * $icoSizes.Count)
  for ($i = 0; $i -lt $icoSizes.Count; $i++) {
    $size = $icoSizes[$i]
    $writer.Write([byte]$size)
    $writer.Write([byte]$size)
    $writer.Write([byte]0)
    $writer.Write([byte]0)
    $writer.Write([UInt16]1)
    $writer.Write([UInt16]32)
    $writer.Write([UInt32]$images[$i].Length)
    $writer.Write([UInt32]$offset)
    $offset += $images[$i].Length
  }
  foreach ($bytes in $images) { $writer.Write([byte[]]$bytes) }
  $writer.Flush()
  [System.IO.File]::WriteAllBytes((Join-Path $root 'public/favicon.ico'), $ico.ToArray())
}
finally {
  $writer.Dispose()
}

Write-Output 'Icones do Brain Versus Brain gerados.'
