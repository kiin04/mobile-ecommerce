# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["WebAPI/WebAPI/WebAPI.csproj", "WebAPI/WebAPI/"]
RUN dotnet restore "WebAPI/WebAPI/WebAPI.csproj"
COPY . . 
WORKDIR "/src/WebAPI/WebAPI"
RUN dotnet publish "WebAPI.csproj" -c Release -o /app/publish

# Stage 2: Run
FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "WebAPI.dll"]