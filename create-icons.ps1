Add-Type -AssemblyName System.Drawing

$iconDir = $PSScriptRoot + "\icons"

$sizes = @(
    @{ Size = 16;  Name = "favicon-16.png" },
    @{ Size = 32;  Name = "icon-32.png" },
    @{ Size = 180; Name = "icon-180.png" },
    @{ Size = 192; Name = "icon-192.png" },
    @{ Size = 512; Name = "icon-512.png" }
)

foreach ($item in $sizes) {
    $sz = $item.Size
    $outPath = Join-Path $iconDir $item.Name

    $bmp = New-Object System.Drawing.Bitmap($sz, $sz)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    $bgColor = [System.Drawing.Color]::FromArgb(255, 30, 60, 114)
    $bgBrush = New-Object System.Drawing.SolidBrush($bgColor)
    $g.FillEllipse($bgBrush, 0, 0, ($sz - 1), ($sz - 1))

    $innerColor = [System.Drawing.Color]::FromArgb(76, 30, 74, 158)
    $innerBrush = New-Object System.Drawing.SolidBrush($innerColor)
    $inset = [int]($sz * 0.109)
    $innerSz = $sz - 2 * $inset
    $g.FillEllipse($innerBrush, $inset, $inset, $innerSz, $innerSz)

    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $s = $sz / 192.0
    $vx = [int](85 * $s)
    $vy = [int](36 * $s)
    $vw = [int](22 * $s)
    $vh = [int](120 * $s)
    $hx = [int](48 * $s)
    $hy = [int](73 * $s)
    $hw = [int](96 * $s)
    $hh = [int](22 * $s)
    $g.FillRectangle($whiteBrush, $vx, $vy, $vw, $vh)
    $g.FillRectangle($whiteBrush, $hx, $hy, $hw, $hh)

    $goldColor = [System.Drawing.Color]::FromArgb(204, 245, 158, 11)
    $goldBrush = New-Object System.Drawing.SolidBrush($goldColor)
    $dotR = [math]::Max(1, [int](4 * $s))
    $cx = [int](96 * $s)
    $g.FillEllipse($goldBrush, ($cx - $dotR), ([int](41 * $s) - $dotR), ($dotR * 2), ($dotR * 2))
    $g.FillEllipse($goldBrush, ($cx - $dotR), ([int](151 * $s) - $dotR), ($dotR * 2), ($dotR * 2))
    $g.FillEllipse($goldBrush, ([int](53 * $s) - $dotR), ([int](84 * $s) - $dotR), ($dotR * 2), ($dotR * 2))
    $g.FillEllipse($goldBrush, ([int](139 * $s) - $dotR), ([int](84 * $s) - $dotR), ($dotR * 2), ($dotR * 2))

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $bgBrush.Dispose()
    $innerBrush.Dispose()
    $whiteBrush.Dispose()
    $goldBrush.Dispose()

    Write-Host "Created $outPath ($sz x $sz)"
}

Write-Host "`nAll icons created."
