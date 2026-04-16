# Movie Stills Workflow

Target resolution: **1200x1090** (JPEG, quality 95)

## Strategy

- Scale to fit height=1090 (preserving full scene vertically)
- Center-crop width to 1200
- Max upscale threshold: ~10% (images needing more are skipped)
- Images too narrow after scaling are also skipped

## Sources

1. **TMDB backdrops** — primary source, usually highest resolution
   - Find movie ID: search `site:themoviedb.org {movie title} {year}`
   - Backdrops page: `https://www.themoviedb.org/movie/{ID}/images/backdrops`
   - Download URL: `https://image.tmdb.org/t/p/original/{path}.jpg`

2. **WallpaperCave** — supplemental
   - Try: `https://www.wallpapercave.com/{movie-slug}-wallpapers`
   - Also try: `{movie-slug}-movie-wallpapers`
   - Download URL: `https://wallpapercave.com/wp/wp{ID}.jpg`

## Download

```bash
mkdir -p {movie}_raw && cd {movie}_raw

# TMDB
n=0
for p in {paths}; do
  n=$((n+1))
  idx=$(printf "%02d" $n)
  curl -sL -o "tmdb_${idx}.jpg" "https://image.tmdb.org/t/p/original/${p}.jpg"
done

# WallpaperCave
n=0
for id in {ids}; do
  n=$((n+1))
  idx=$(printf "%02d" $n)
  curl -sL -o "wc_${idx}.jpg" "https://wallpapercave.com/wp/wp${id}.jpg"
done
```

## Process

Run from inside the `{movie}_raw/` directory:

```bash
cd {movie}_raw/
python3 ../../scripts/movie-images-process.py {movie_name}
```

Output goes to `../{movie_name}_1200x1090/`.

## Output

Each movie gets two directories under `movie-images/` in the repo:
- `{movie}_raw/` — original downloads
- `{movie}_1200x1090/` — processed 1200x1090 images

## Notes

- Always verify TMDB movie ID before fetching (wrong IDs have returned wrong movies)
- Use `if img.mode != 'RGB'` (not just RGBA) to handle palette-mode PNGs
- Niche/arthouse films may only yield a handful of images
- Spot-check a couple of processed images visually after each batch
