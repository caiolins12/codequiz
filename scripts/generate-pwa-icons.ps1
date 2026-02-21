Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

$root = (Resolve-Path '.').Path
$sourcePath = Join-Path $root 'icons\codequizlogo.png'

if (-not (Test-Path $sourcePath)) {
  throw "Arquivo fonte nao encontrado: $sourcePath"
}

$icons = @(
  @{ Size = 180; Path = 'icons/icon-180.png' },
  @{ Size = 192; Path = 'icons/icon-192.png' },
  @{ Size = 512; Path = 'icons/icon-512.png' }
)

$source = [System.Drawing.Bitmap]::FromFile($sourcePath)
try {
  foreach ($icon in $icons) {
    $size = [int]$icon.Size
    $outPath = Join-Path $root $icon.Path

    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $attrs = New-Object System.Drawing.Imaging.ImageAttributes
    try {
      $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
      $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

      # Usa a arte completa do arquivo fonte para evitar corte do logo.
      $attrs.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
      $g.DrawImage(
        $source,
        (New-Object System.Drawing.Rectangle(0, 0, $size, $size)),
        0,
        0,
        $source.Width,
        $source.Height,
        [System.Drawing.GraphicsUnit]::Pixel,
        $attrs
      )

      $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
      $attrs.Dispose()
      $g.Dispose()
      $bmp.Dispose()
    }
  }
}
finally {
  $source.Dispose()
}

Write-Output 'PWA icons gerados com sucesso.'
